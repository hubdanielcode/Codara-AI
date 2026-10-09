import React from "react";
import { renderHook } from "@testing-library/react";
import { useMessageContext } from "@/features/code-review/hooks/useMessageContext";
import { MessageContext } from "@/features/code-review/context/MessageContext";
import type { MessageContextType } from "@/features/code-review/context/MessageContext";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockContext: MessageContextType = {
  content: "Hello World",
  setContent: vi.fn(),
  clearContextData: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o hook com Provider - */

const renderWithContext = (context: MessageContextType | null) =>
  renderHook(() => useMessageContext(), {
    wrapper: ({ children }) =>
      React.createElement(
        MessageContext.Provider,
        { value: context },
        children,
      ),
  });

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderWithContext(mockContext);

  expect(result.current.content).toBe("Hello World");
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderWithContext(null)).toThrow(
    "MessageContext must be used inside an MessageProvider",
  );
});
