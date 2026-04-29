import React from "react";
import { renderHook } from "@testing-library/react";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import {
  ThemeContext,
  type ThemeContextType,
} from "@/shared/context/ThemeContext";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockContext: ThemeContextType = {
  theme: "Light",
  toggleTheme: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o hook com Provider - */

const renderWithContext = (context: ThemeContextType | null) =>
  renderHook(() => useThemeContext(), {
    wrapper: ({ children }) =>
      React.createElement(ThemeContext.Provider, { value: context }, children),
  });

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderWithContext(mockContext);

  expect(result.current.theme).toBe("Light");
  expect(result.current.toggleTheme).toBeTypeOf("function");
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderWithContext(null)).toThrow(
    "useThemeContext must be used within a ThemeProvider",
  );
});
