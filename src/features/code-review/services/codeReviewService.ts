import { supabase } from "@/supabase/supabase";
import type { CodeReview } from "../types/codeReview";

type ReviewResult = Pick<CodeReview, "errors" | "suggestions" | "improvements" | "corrected_code">;

/* - Chama a função /api/ai (a chave da Groq fica só no servidor) - */

const callAI = async (prompt: string): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Você precisa estar logado para analisar código.");
  }

  let response: Response;

  try {
    response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ prompt }),
    });
  } catch {
    throw new Error("Não foi possível analisar o código agora. Tente novamente.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    console.error("Erro da API /api/ai:", response.status, errorData);

    throw new Error(
      errorData?.error ?? (response.status === 401 ? "Sua sessão expirou. Entre novamente." : `Erro do servidor (${response.status}).`),
    );
  }

  const data = await response.json().catch(() => null);

  if (!data?.content) {
    throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
  }

  return String(data.content).trim();
};

/* - Extrai e valida o JSON, mesmo que venha dentro de markdown - */

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

const parseReview = (raw: string): ReviewResult => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }

  if (
    !isStringArray(parsed.errors) ||
    !isStringArray(parsed.suggestions) ||
    !isStringArray(parsed.improvements) ||
    typeof parsed.corrected_code !== "string"
  ) {
    throw new Error("A resposta da IA veio incompleta. Tente novamente.");
  }

  return {
    errors: parsed.errors,
    suggestions: parsed.suggestions,
    improvements: parsed.improvements,
    corrected_code: parsed.corrected_code,
  };
};

const analyzeCode = async (code: string): Promise<ReviewResult> => {
  const result = await callAI(`Você é um revisor de código sênior extremamente criterioso. Analise o código abaixo com rigor técnico real.

Retorne APENAS JSON puro, sem markdown, sem backticks, sem texto adicional antes ou depois.

Estrutura obrigatória:
{
  "errors": ["erros reais que causam bugs, crashes ou comportamento incorreto. Se não houver, retorne array vazio."],
  "suggestions": ["melhorias de legibilidade, nomenclatura ou organização. Se não houver, retorne array vazio."],
  "improvements": ["otimizações de performance, segurança ou boas práticas. Se não houver, retorne array vazio."],
  "corrected_code": "código original com todas as correções aplicadas, preservando quebras de linha e indentação"
}

Regras:
- Só aponte erros que realmente existem no código. Não invente problemas.
- Seja específico: diga qual linha ou trecho tem o problema e por quê.
- O corrected_code deve conter APENAS as correções dos erros encontrados, sem alterar o resto.

Código para analisar:
${code}`);

  return parseReview(result);
};

export const generateChatTitle = async (code: string): Promise<string> => {
  return callAI(
    `Gere um título curto (máximo 4 palavras) para uma conversa sobre esse código. Retorne APENAS o título, sem aspas, sem pontuação.\n\n${code}`,
  );
};

export { analyzeCode };
