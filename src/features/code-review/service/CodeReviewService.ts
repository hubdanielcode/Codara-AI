import { supabase } from "@/supabase/supabase";
import type { CodeReview } from "../types/codeReview";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/* - Chamando a IA do Groq para analisar o código - */

const callGroqAI = async (prompt: string) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

/* - Analisando o código - */

const analyzeCode = async (
  code: string,
  chatId: string,
): Promise<CodeReview> => {
  const result =
    await callGroqAI(`Você é um revisor de código sênior extremamente criterioso. Analise o código abaixo com rigor técnico real.

Retorne APENAS JSON puro, sem markdown, sem backticks, sem texto adicional antes ou depois.

Estrutura obrigatória:
{
  "errors": ["erros reais que causam bugs, crashes ou comportamento incorreto. Se não houver, retorne array vazio."],
  "suggestions": ["melhorias de legibilidade, nomenclatura ou organização. Se não houver, retorne array vazio."],
  "improvements": ["otimizações de performance, segurança ou boas práticas. Se não houver, retorne array vazio."],
  "correctedCode": "código original com todas as correções aplicadas, preservando quebras de linha e indentação"
}

Regras:
- Só aponte erros que realmente existem no código. Não invente problemas.
- Seja específico: diga qual linha ou trecho tem o problema e por quê.
- O correctedCode deve conter APENAS as correções dos erros encontrados, sem alterar o resto.

Código para analisar:
${code}`);

  const cleaned = result.replace(/```json|```/g, "").trim();
  const parsedResponse = JSON.parse(cleaned);

  /* - Salvando a resposta no Supabase - */

  await supabase
    .from("messages")
    .insert({ chat_id: chatId, content: code, role: "user" })
    .select();

  await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      content: parsedResponse.correctedCode,
      role: "admin",
      errors: parsedResponse.errors ?? [],
      suggestions: parsedResponse.suggestions ?? [],
      improvements: parsedResponse.improvements ?? [],
    })
    .select("*");

  return parsedResponse;
};

/* - Gerando um título apropriado - */

export const generateChatTitle = async (code: string): Promise<string> => {
  return callGroqAI(
    `Gere um título curto (máximo 4 palavras) para uma conversa sobre esse código. Retorne APENAS o título, sem aspas, sem pontuação.\n\n${code}`,
  );
};

export { analyzeCode };
