import { render, screen } from "@testing-library/react";
import { AppProviders } from "@/shared/providers/AppProviders";
import type { Session } from "@supabase/supabase-js";

/* - Criando o mock de todos os providers - */

vi.mock("@/features/authentication/context/AuthenticationContext", () => ({
  AuthenticationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authentication-provider">{children}</div>
  ),
}));

vi.mock("@/shared/context/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock("@/features/code-review/context/ChatContext", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chat-provider">{children}</div>
  ),
}));

vi.mock("@/features/code-review/context/CodeReviewContext", () => ({
  CodeReviewProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="code-review-provider">{children}</div>
  ),
}));

vi.mock("@/features/code-review/context/MessageContext", () => ({
  MessageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="message-provider">{children}</div>
  ),
}));

vi.mock("@/features/code-review/context/PatchContext", () => ({
  PatchProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="patch-provider">{children}</div>
  ),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o componente - */

const renderComponent = (session: Session | null = null) =>
  render(
    <AppProviders session={session}>
      <div data-testid="child">Child</div>
    </AppProviders>,
  );

/* - Testando a renderização dos providers - */

test("should render all providers", () => {
  renderComponent();

  expect(screen.getByTestId("authentication-provider")).toBeInTheDocument();
  expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
  expect(screen.getByTestId("chat-provider")).toBeInTheDocument();
  expect(screen.getByTestId("code-review-provider")).toBeInTheDocument();
  expect(screen.getByTestId("message-provider")).toBeInTheDocument();
  expect(screen.getByTestId("patch-provider")).toBeInTheDocument();
});

test("should render children inside providers", () => {
  renderComponent();

  expect(screen.getByTestId("child")).toBeInTheDocument();
  expect(screen.getByText("Child")).toBeInTheDocument();
});

test("should render with a valid session", () => {
  const mockSession = { user: { id: "123" } } as Session;

  renderComponent(mockSession);

  expect(screen.getByTestId("child")).toBeInTheDocument();
});

test("should render with a null session", () => {
  renderComponent(null);

  expect(screen.getByTestId("child")).toBeInTheDocument();
});
