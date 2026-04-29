import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import {
  CodeReviewContext,
  CodeReviewProvider,
  type CodeReviewContextType,
} from "@/features/code-review/context/CodeReviewContext";
import userEvent from "@testing-library/user-event";
import { analyzeCode as analyzeCodeService } from "@/features/code-review/services/CodeReviewService";
import { supabase } from "@/supabase/supabase";
import type { CodeReview } from "@/features/code-review/types/codeReview";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

/* - Criando o mock do serviço de code review - */

vi.mock("@/features/code-review/services/CodeReviewService", () => ({
  analyzeCode: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Dados mockados para reutilização nos testes - */

const mockUser = { id: "123", email: "john@email.com" };

const mockAuthenticatedUser = () =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: mockUser as any },
    error: null as any,
  });

const mockUnauthenticatedUser = () =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: null as any },
    error: null as any,
  });

const mockInsertSuccess = () =>
  vi.mocked(supabase.from).mockReturnValue({
    insert: vi.fn(() => Promise.resolve({ error: null })),
  } as any);

const mockParsedResponse: CodeReview = {
  id: "1",
  chat_id: "chat-123",
  original_code: "const x = 1",
  corrected_code: "const x = 1;",
  errors: ["erro 1", "erro 2"],
  suggestions: ["sugestão 1"],
  improvements: ["melhoria 1"],
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<CodeReviewContextType | null>(CodeReviewContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="error">{JSON.stringify(context.error)}</span>
      <span data-testid="improvement">
        {JSON.stringify(context.improvement)}
      </span>
      <span data-testid="suggestion">{JSON.stringify(context.suggestion)}</span>
      <span data-testid="correctedCode">{context.correctedCode}</span>
      <button onClick={() => context.setError(["erro 1"])}>Set Error</button>
      <button onClick={() => context.setImprovement(["melhoria 1"])}>
        Set Improvement
      </button>
      <button onClick={() => context.setSuggestion(["sugestão 1"])}>
        Set Suggestion
      </button>
      <button onClick={() => context.setCorrectedCode("const x = 1;")}>
        Set Corrected Code
      </button>
      <button onClick={() => context.analyzeCode("const x = 1", "chat-123")}>
        Analyze Code
      </button>
    </div>
  );
};

/* - Componente auxiliar para capturar a referência do contexto - */

const ContextCapture = ({
  contextRef,
}: {
  contextRef: { current: CodeReviewContextType | null };
}) => {
  contextRef.current = useContext<CodeReviewContextType | null>(
    CodeReviewContext,
  );
  return null;
};

/* - Função para renderizar o componente com Provider - */

const renderComponent = () =>
  render(
    <CodeReviewProvider>
      <TestConsumer />
    </CodeReviewProvider>,
  );

/* - Testando a renderização inicial - */

test("should render children with initial values", () => {
  renderComponent();

  expect(screen.getByTestId("error")).toHaveTextContent("[]");
  expect(screen.getByTestId("improvement")).toHaveTextContent("[]");
  expect(screen.getByTestId("suggestion")).toHaveTextContent("[]");
  expect(screen.getByTestId("correctedCode")).toHaveTextContent("");
});

/* - Testando as funções de atualização de estado - */

test("should update error when setError is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Error"));

  expect(screen.getByTestId("error")).toHaveTextContent("erro 1");
});

test("should update improvement when setImprovement is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Improvement"));

  expect(screen.getByTestId("improvement")).toHaveTextContent("melhoria 1");
});

test("should update suggestion when setSuggestion is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Suggestion"));

  expect(screen.getByTestId("suggestion")).toHaveTextContent("sugestão 1");
});

test("should update correctedCode when setCorrectedCode is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Corrected Code"));

  expect(screen.getByTestId("correctedCode")).toHaveTextContent("const x = 1;");
});

/* - Testando o analyzeCode - */

test("should reset all states before analyzing", async () => {
  mockAuthenticatedUser();
  mockInsertSuccess();
  vi.mocked(analyzeCodeService).mockResolvedValueOnce(mockParsedResponse);

  renderComponent();

  await userEvent.click(screen.getByText("Set Error"));
  await userEvent.click(screen.getByText("Analyze Code"));

  await waitFor(() => {
    expect(screen.getByTestId("error")).toHaveTextContent("erro 1");
  });
});

test("should throw an error when user is not authenticated", async () => {
  mockUnauthenticatedUser();

  const contextRef = { current: null as CodeReviewContextType | null };

  render(
    <CodeReviewProvider>
      <ContextCapture contextRef={contextRef} />
    </CodeReviewProvider>,
  );

  await expect(
    contextRef.current!.analyzeCode("const x = 1", "chat-123"),
  ).rejects.toThrow("Usuário não autenticado!");
});

test("should call supabase.from('messages').insert with user message", async () => {
  mockAuthenticatedUser();
  const insertMock = vi.fn(() => Promise.resolve({ error: null }));
  vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as any);
  vi.mocked(analyzeCodeService).mockResolvedValueOnce(mockParsedResponse);

  renderComponent();

  await userEvent.click(screen.getByText("Analyze Code"));

  await waitFor(() => {
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "123",
      chat_id: "chat-123",
      content: "const x = 1",
      role: "user",
    });
  });
});

test("should call analyzeCodeService with the correct code", async () => {
  mockAuthenticatedUser();
  mockInsertSuccess();
  vi.mocked(analyzeCodeService).mockResolvedValueOnce(mockParsedResponse);

  renderComponent();

  await userEvent.click(screen.getByText("Analyze Code"));

  await waitFor(() => {
    expect(analyzeCodeService).toHaveBeenCalledWith("const x = 1");
  });
});

test("should set states with parsed response after analyzeCode", async () => {
  mockAuthenticatedUser();
  mockInsertSuccess();
  vi.mocked(analyzeCodeService).mockResolvedValueOnce(mockParsedResponse);

  renderComponent();

  await userEvent.click(screen.getByText("Analyze Code"));

  await waitFor(() => {
    expect(screen.getByTestId("error")).toHaveTextContent("erro 1");
    expect(screen.getByTestId("suggestion")).toHaveTextContent("sugestão 1");
    expect(screen.getByTestId("improvement")).toHaveTextContent("melhoria 1");
    expect(screen.getByTestId("correctedCode")).toHaveTextContent(
      "const x = 1;",
    );
  });
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
