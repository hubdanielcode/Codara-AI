import {
  analyzeCode,
  generateChatTitle,
} from "@/features/code-review/services/codeReviewService";
import { supabase } from "@/supabase/supabase";

/* - Mock do supabase: só a sessão é usada neste serviço - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);

  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: { access_token: "token-123" } },
    error: null,
  } as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockAIResponse = (content: string) =>
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ content }),
  });

const mockParsedResponse = {
  errors: ["erro 1"],
  suggestions: ["sugestão 1"],
  improvements: ["melhoria 1"],
  corrected_code: "const x = 1;",
};

/* - analyzeCode - */

test("should call /api/ai with the user's token and the code in the prompt", async () => {
  mockAIResponse(JSON.stringify(mockParsedResponse));

  await analyzeCode("const x = 1");

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/ai",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: "Bearer token-123",
      }),
      body: expect.stringContaining("const x = 1"),
    }),
  );
});

test("should return the parsed review on success", async () => {
  mockAIResponse(JSON.stringify(mockParsedResponse));

  const result = await analyzeCode("const x = 1");

  expect(result).toEqual(mockParsedResponse);
});

test("should handle response wrapped in markdown code blocks", async () => {
  mockAIResponse("```json\n" + JSON.stringify(mockParsedResponse) + "\n```");

  const result = await analyzeCode("const x = 1");

  expect(result).toEqual(mockParsedResponse);
});

test("should handle text before and after the JSON", async () => {
  mockAIResponse(
    "Aqui está a análise:\n" +
      JSON.stringify(mockParsedResponse) +
      "\nEspero ter ajudado.",
  );

  const result = await analyzeCode("const x = 1");

  expect(result).toEqual(mockParsedResponse);
});

test("should throw when the user is not logged in", async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
    data: { session: null },
    error: null,
  } as never);

  await expect(analyzeCode("const x = 1")).rejects.toThrow("precisa estar logado");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("should throw a friendly error when the request fails", async () => {
  fetchMock.mockRejectedValueOnce(new Error("network"));

  await expect(analyzeCode("const x = 1")).rejects.toThrow(
    "Não foi possível analisar o código agora",
  );
});

test("should ask the user to log in again when the API returns 401", async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });

  await expect(analyzeCode("const x = 1")).rejects.toThrow("sessão expirou");
});

test("should throw a friendly error when the API returns 502", async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.resolve({}) });

  await expect(analyzeCode("const x = 1")).rejects.toThrow(
    "Não foi possível analisar o código agora",
  );
});

test("should throw when the AI returns an empty response", async () => {
  mockAIResponse("");

  await expect(analyzeCode("const x = 1")).rejects.toThrow("resposta vazia");
});

test("should throw when the response has no JSON", async () => {
  mockAIResponse("texto sem nenhum json");

  await expect(analyzeCode("const x = 1")).rejects.toThrow("formato inválido");
});

test("should throw when the JSON is malformed", async () => {
  mockAIResponse("{ isso nao e json }");

  await expect(analyzeCode("const x = 1")).rejects.toThrow(
    "Não foi possível interpretar",
  );
});

test("should throw when a required field is missing", async () => {
  mockAIResponse(
    JSON.stringify({ errors: [], suggestions: [], improvements: [] }),
  );

  await expect(analyzeCode("const x = 1")).rejects.toThrow("incompleta");
});

test("should throw when a field has the wrong type", async () => {
  mockAIResponse(
    JSON.stringify({ ...mockParsedResponse, errors: "não é array" }),
  );

  await expect(analyzeCode("const x = 1")).rejects.toThrow("incompleta");
});

/* - generateChatTitle - */

test("should return the generated title", async () => {
  mockAIResponse("Análise de Código");

  const result = await generateChatTitle("const x = 1");

  expect(result).toBe("Análise de Código");
});

test("should send the code to /api/ai when generating a title", async () => {
  mockAIResponse("Análise de Código");

  await generateChatTitle("const x = 1");

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/ai",
    expect.objectContaining({ body: expect.stringContaining("const x = 1") }),
  );
});

test("should throw when the request fails in generateChatTitle", async () => {
  fetchMock.mockRejectedValueOnce(new Error("network"));

  await expect(generateChatTitle("const x = 1")).rejects.toThrow(
    "Não foi possível analisar o código agora",
  );
});
