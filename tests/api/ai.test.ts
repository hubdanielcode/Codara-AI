import handler from "../../api/ai";

/* - Resposta falsa, com a mesma interface que a Vercel entrega ao handler - */

const createResponse = () => {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(payload: unknown) {
      response.body = payload;
    },
  };

  return response;
};

const fetchMock = vi.fn();

const validRequest = (overrides: Record<string, unknown> = {}) => ({
  method: "POST",
  headers: { authorization: "Bearer token-123" },
  body: { prompt: "analise isso" },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("VITE_SUPABASE_URL", "https://projeto.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("GROQ_API_KEY", "gsk_chave_de_teste");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const mockSupabaseOk = () => fetchMock.mockResolvedValueOnce({ ok: true });

const mockGroqOk = (content: string) =>
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content } }] }),
  });

test("should reject methods other than POST", async () => {
  const response = createResponse();

  await handler(validRequest({ method: "GET" }), response);

  expect(response.statusCode).toBe(405);
});

test("should reject requests without a token", async () => {
  const res = createResponse();

  await handler(validRequest({ headers: {} }), res);

  expect(res.statusCode).toBe(401);
  expect(fetchMock).not.toHaveBeenCalled();
});

test("should reject an invalid session", async () => {
  fetchMock.mockResolvedValueOnce({ ok: false });
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(401);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("should validate the token against Supabase", async () => {
  mockSupabaseOk();
  mockGroqOk("ok");

  await handler(validRequest(), createResponse());

  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    "https://projeto.supabase.co/auth/v1/user",
    expect.objectContaining({
      headers: { apikey: "anon-key", Authorization: "Bearer token-123" },
    }),
  );
});

test("should return 500 when Supabase is unreachable", async () => {
  fetchMock.mockRejectedValueOnce(new Error("network"));
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(500);
});

test("should reject an invalid prompt", async () => {
  mockSupabaseOk();
  const res = createResponse();

  await handler(validRequest({ body: { prompt: "" } }), res);

  expect(res.statusCode).toBe(400);
});

test("should reject a prompt that is too long", async () => {
  mockSupabaseOk();
  const res = createResponse();

  await handler(validRequest({ body: { prompt: "a".repeat(20001) } }), res);

  expect(res.statusCode).toBe(400);
});

test("should accept a JSON string body", async () => {
  mockSupabaseOk();
  mockGroqOk("resposta");
  const res = createResponse();

  await handler(validRequest({ body: JSON.stringify({ prompt: "analise isso" }) }), res);

  expect(res.statusCode).toBe(200);
});

test("should return 500 when GROQ_API_KEY is not configured", async () => {
  vi.stubEnv("GROQ_API_KEY", "");
  mockSupabaseOk();
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(500);
});

test("should call Groq with the key, the model and the prompt", async () => {
  mockSupabaseOk();
  mockGroqOk("resposta");

  await handler(validRequest(), createResponse());

  const [url, options] = fetchMock.mock.calls[1];

  expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
  expect(options.headers.Authorization).toBe("Bearer gsk_chave_de_teste");

  const body = JSON.parse(options.body);

  expect(body.model).toBe("openai/gpt-oss-120b");
  expect(body.temperature).toBe(0);
  expect(body.messages).toEqual([{ role: "user", content: "analise isso" }]);
});

test("should return the AI content on success", async () => {
  mockSupabaseOk();
  mockGroqOk("resposta da IA");
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ content: "resposta da IA" });
});

test("should return 502 without leaking details when Groq fails", async () => {
  mockSupabaseOk();
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status: 401,
    text: () => Promise.resolve("invalid_api_key gsk_segredo"),
  });
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(502);
  expect(JSON.stringify(res.body)).not.toContain("gsk_");
});

test("should return 502 when the request to Groq throws", async () => {
  mockSupabaseOk();
  fetchMock.mockRejectedValueOnce(new Error("network"));
  const res = createResponse();

  await handler(validRequest(), res);

  expect(res.statusCode).toBe(502);
});
