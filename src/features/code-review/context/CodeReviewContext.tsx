import { supabase } from "@/supabase/supabase";
import { createContext, useState, type ReactNode } from "react";

export interface CodeReviewContextType {
  /* - Dados do código - */

  error: string[];
  setError: (error: string[]) => void;
  improvement: string[];
  setImprovement: (improvement: string[]) => void;
  suggestion: string[];
  setSuggestion: (suggestion: string[]) => void;
  correctedCode: string;
  setCorrectedCode: (correctedCode: string) => void;

  /* - Funções - */

  analyzeCode: (code: string, chatId: string) => Promise<void>;
}

const CodeReviewContext = createContext<CodeReviewContextType | null>(null);

const CodeReviewProvider = ({ children }: { children: ReactNode }) => {
  /* - Dados do código - */

  const [error, setError] = useState<string[]>([]);
  const [improvement, setImprovement] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<string[]>([]);
  const [correctedCode, setCorrectedCode] = useState<string>("");

  /* - Funções - */

  const analyzeCode = async (code: string, chatId: string) => {
    setError([]);
    setSuggestion([]);
    setImprovement([]);
    setCorrectedCode("");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `Você é um revisor de código. Analise o código abaixo e retorne APENAS um JSON válido, sem markdown, sem blocos de código, sem texto extra.

Estrutura obrigatória:
{
  "errors": ["string com erro encontrado"],
  "suggestions": ["string com sugestão"],
  "improvements": ["string com melhoria"],
  "correctedCode": "código corrigido aqui como string"
}

O correctedCode é OBRIGATÓRIO e deve sempre conter o código original com todas as correções aplicadas, mesmo que o código esteja correto.

O correctedCode deve preservar todas as quebras de linha e indentação do código original, usando \n para cada nova linha.

Código para analisar:
${code}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const parsed = JSON.parse(text);

    setError(parsed.errors ?? []);
    setSuggestion(parsed.suggestions ?? []);
    setImprovement(parsed.improvements ?? []);
    setCorrectedCode(parsed.correctedCode ?? "");

    await supabase.from("messages").insert({
      chat_id: chatId,
      content: code,
      role: "user",
    });

    await supabase.from("messages").insert({
      chat_id: chatId,
      content: parsed.correctedCode,
      role: "admin",
      errors: parsed.errors ?? [],
      suggestions: parsed.suggestions ?? [],
      improvements: parsed.improvements ?? [],
    });
  };

  return (
    <CodeReviewContext.Provider
      value={{
        /* - Dados do código - */

        error,
        setError,
        improvement,
        setImprovement,
        suggestion,
        setSuggestion,
        correctedCode,
        setCorrectedCode,

        /* - Funções - */

        analyzeCode,
      }}
    >
      {children}
    </CodeReviewContext.Provider>
  );
};

export { CodeReviewContext, CodeReviewProvider };
