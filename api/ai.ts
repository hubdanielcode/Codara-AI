/* - Função serverless (Vercel) que chama a IA. A chave da Groq fica só aqui, no servidor - */

declare const process: { env: Record<string, string | undefined> };

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
const MAX_PROMPT_LENGTH = 20000;

const getHeader = (headers: ApiRequest["headers"], name: string) => {
  const value = headers[name];

  return Array.isArray(value) ? value[0] : value;
};

/* - Confere com o Supabase se o token enviado pertence a um usuário logado - */

const isValidSession = async (token: string): Promise<boolean> => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });

  return response.ok;
};

const parseBody = (body: unknown): Record<string, unknown> => {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido." });
  }

  /* - Só usuários logados podem usar a IA - */

  const authorization = getHeader(request.headers, "authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return response.status(401).json({ error: "Não autenticado." });
  }

  try {
    if (!(await isValidSession(token))) {
      return response.status(401).json({ error: "Sessão inválida ou expirada." });
    }
  } catch (error) {
    console.error("Erro ao validar a sessão:", error);

    return response.status(500).json({ error: "Não foi possível validar a sessão no servidor." });
  }

  /* - Validação do prompt - */

  const { prompt } = parseBody(request.body);

  if (typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > MAX_PROMPT_LENGTH) {
    return response.status(400).json({ error: "Prompt inválido." });
  }

  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    console.error("GROQ_API_KEY não está configurada no servidor.");

    return response.status(500).json({ error: "A IA não está configurada." });
  }

  /* - Chamada pro Groq - */

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!groqResponse.ok) {
      const detail = await groqResponse.text();

      console.error("Erro da Groq:", groqResponse.status, detail.slice(0, 300));

      return response.status(502).json({ error: "A IA não respondeu. Tente novamente." });
    }

    const data = await groqResponse.json();

    return response.status(200).json({ content: data?.choices?.[0]?.message?.content ?? "" });
  } catch (error) {
    console.error("Erro ao chamar a Groq:", error);

    return response.status(502).json({ error: "A IA não respondeu. Tente novamente." });
  }
}
