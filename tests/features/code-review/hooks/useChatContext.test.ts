import React from "react";
import { renderHook } from "@testing-library/react";
import { useChatContext } from "@/features/code-review/hooks/useChatContext";
import {
  ChatContext,
  type ChatContextType,
} from "@/features/code-review/context/ChatContext";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockContext: ChatContextType = {
  title: "Chat Title",
  setTitle: vi.fn(),
  selectedChatId: "123",
  setSelectedChatId: vi.fn(),
  chats: [],
  setChats: vi.fn(),
  fetchChats: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o hook com Provider - */

const renderWithContext = (context: ChatContextType | null) =>
  renderHook(() => useChatContext(), {
    wrapper: ({ children }) =>
      React.createElement(ChatContext.Provider, { value: context }, children),
  });

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderWithContext(mockContext);

  expect(result.current.title).toBe("Chat Title");
  expect(result.current.selectedChatId).toBe("123");
  expect(result.current.chats).toEqual([]);
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderWithContext(null)).toThrow(
    "ChatContext must be used inside an ChatProvider",
  );
});
