import React from "react";
import { renderHook } from "@testing-library/react";
import { usePatchContext } from "@/features/code-review/hooks/usePatchContext";
import {
  PatchContext,
  type PatchContextType,
} from "@/features/code-review/context/PatchContext";
import type { Patch } from "@/features/code-review/types/patch";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockPatches: Patch[] = [
  {
    id: "1",
    user_id: "123",
    chat_id: "chat-1",
    title: "Patch 1",
    had_errors: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockContext: PatchContextType = {
  updateTitle: "Update Title",
  setUpdateTitle: vi.fn(),
  date: "2024-01-01",
  setDate: vi.fn(),
  patches: mockPatches,
  setPatches: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o hook com Provider - */

const renderWithContext = (context: PatchContextType | null) =>
  renderHook(() => usePatchContext(), {
    wrapper: ({ children }) =>
      React.createElement(PatchContext.Provider, { value: context }, children),
  });

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderWithContext(mockContext);

  expect(result.current.updateTitle).toBe("Update Title");
  expect(result.current.date).toBe("2024-01-01");
  expect(result.current.patches).toEqual(mockPatches);
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderWithContext(null)).toThrow(
    "PatchContext must be used within a PatchProvider",
  );
});
