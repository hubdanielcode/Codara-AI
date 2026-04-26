import { createContext, useState, type ReactNode } from "react";
import { analyzeCode as analyzeCodeService } from "../service/CodeReviewService";

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

    const parsed = await analyzeCodeService(code, chatId);

    setError(parsed.errors ?? []);
    setSuggestion(parsed.suggestions ?? []);
    setImprovement(parsed.improvements ?? []);
    setCorrectedCode(parsed.corrected_code ?? "");
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
