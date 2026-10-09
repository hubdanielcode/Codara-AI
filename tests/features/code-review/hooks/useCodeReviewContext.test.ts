import React from "react";
import { renderHook } from "@testing-library/react";
import { useCodeReviewContext } from "@/features/code-review/hooks/useCodeReviewContext";
import {
  CodeReviewContext,
  type CodeReviewContextType,
} from "@/features/code-review/context/CodeReviewContext";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockContext: CodeReviewContextType = {
  error: [],
  setError: vi.fn(),
  improvement: [],
  setImprovement: vi.fn(),
  suggestion: [],
  setSuggestion: vi.fn(),
  correctedCode: "",
  setCorrectedCode: vi.fn(),
  analyzeCode: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o hook com Provider - */

const renderWithContext = (context: CodeReviewContextType | null) =>
  renderHook(() => useCodeReviewContext(), {
    wrapper: ({ children }) =>
      React.createElement(
        CodeReviewContext.Provider,
        { value: context },
        children,
      ),
  });

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderWithContext(mockContext);

  expect(result.current.error).toEqual([]);
  expect(result.current.improvement).toEqual([]);
  expect(result.current.suggestion).toEqual([]);
  expect(result.current.correctedCode).toBe("");
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderWithContext(null)).toThrow(
    "CodeReviewContext must be used inside an CodeReviewProvider",
  );
});
