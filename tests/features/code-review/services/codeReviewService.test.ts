import {
  analyzeCode,
  generateChatTitle,
} from "@/features/code-review/services/CodeReviewService";

/* - Criando o mock do fetch global - */

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Dados mockados para reutilização nos testes - */

const mockGroqResponse = (content: string) =>
  mockFetch.mockResolvedValueOnce({
    json: vi.fn(() =>
      Promise.resolve({
        choices: [{ message: { content } }],
      }),
    ),
  });

const mockParsedResponse = {
  errors: ["erro 1"],
  suggestions: ["sugestão 1"],
  improvements: ["melhoria 1"],
  corrected_code: "const x = 1;",
};

/* - Testando o analyzeCode - */

test("should call fetch with correct URL and method", async () => {
  mockGroqResponse(JSON.stringify(mockParsedResponse));

  await analyzeCode("const x = 1");

  expect(mockFetch).toHaveBeenCalledWith(
    "https://api.groq.com/openai/v1/chat/completions",
    expect.objectContaining({
      method: "POST",
    }),
  );
});

test("should call fetch with correct headers", async () => {
  mockGroqResponse(JSON.stringify(mockParsedResponse));

  await analyzeCode("const x = 1");

  expect(mockFetch).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
    }),
  );
});

test("should return parsed CodeReview object on success", async () => {
  mockGroqResponse(JSON.stringify(mockParsedResponse));

  const result = await analyzeCode("const x = 1");

  expect(result).toEqual(mockParsedResponse);
});

test("should handle response wrapped in markdown code blocks", async () => {
  mockGroqResponse("```json\n" + JSON.stringify(mockParsedResponse) + "\n```");

  const result = await analyzeCode("const x = 1");

  expect(result).toEqual(mockParsedResponse);
});

test("should include the code in the request body", async () => {
  mockGroqResponse(JSON.stringify(mockParsedResponse));

  await analyzeCode("const x = 1");

  const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);

  expect(callBody.messages[0].content).toContain("const x = 1");
});

/* - Testando o generateChatTitle - */

test("should return the generated title as a string", async () => {
  mockGroqResponse("Análise de Código");

  const result = await generateChatTitle("const x = 1");

  expect(result).toBe("Análise de Código");
});

test("should call fetch with the code in the request body for generateChatTitle", async () => {
  mockGroqResponse("Análise de Código");

  await generateChatTitle("const x = 1");

  const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);

  expect(callBody.messages[0].content).toContain("const x = 1");
});

test("should throw when fetch fails in analyzeCode", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));

  await expect(analyzeCode("const x = 1")).rejects.toThrow("Network error");
});

test("should throw when fetch fails in generateChatTitle", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));

  await expect(generateChatTitle("const x = 1")).rejects.toThrow(
    "Network error",
  );
});
