import React from "react";
import { renderHook } from "@testing-library/react";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import {
  AuthenticationContext,
  type AuthenticationContextType,
} from "@/features/authentication/context/AuthenticationContext";

/* - Criando o mock do contexto para reutilização nos testes - */

const mockContext: AuthenticationContextType = {
  name: "John",
  setName: vi.fn(),
  email: "john@email.com",
  setEmail: vi.fn(),
  photo: null,
  setPhoto: vi.fn(),
  userId: "123",
  setUserId: vi.fn(),
  clearContextData: vi.fn(),
};

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando o retorno do hook com contexto válido - */

test("should return the context when used inside a provider", () => {
  const { result } = renderHook(() => useAuthenticationContext(), {
    wrapper: ({ children }) => {
      return React.createElement(
        AuthenticationContext.Provider,
        { value: mockContext },
        children,
      );
    },
  });

  expect(result.current.name).toBe("John");
  expect(result.current.email).toBe("john@email.com");
  expect(result.current.userId).toBe("123");
  expect(result.current.photo).toBeNull();
});

/* - Testando o erro quando usado fora do provider - */

test("should throw an error when used outside of a provider", () => {
  expect(() => renderHook(() => useAuthenticationContext())).toThrow(
    "AuthenticationContext must be used inside an AuthenticationProvider",
  );
});
