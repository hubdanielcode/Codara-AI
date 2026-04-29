import { render, screen, waitFor } from "@testing-library/react";
import { MainPage } from "@/features/code-review/pages/MainPage";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/supabase/supabase";
import { useCodeReviewContext } from "@/features/code-review/hooks/useCodeReviewContext";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useChatContext } from "@/features/code-review/hooks/useChatContext";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import {
  createChat,
  updateChat,
} from "@/features/code-review/services/ChatService";
import { createPatch } from "@/features/code-review/services/PatchService";
import { generateChatTitle } from "@/features/code-review/services/CodeReviewService";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

/* - Criando o mock dos serviços - */

vi.mock("@/features/code-review/services/ChatService", () => ({
  createChat: vi.fn(),
  updateChat: vi.fn(),
}));

vi.mock("@/features/code-review/services/PatchService", () => ({
  createPatch: vi.fn(),
}));

vi.mock("@/features/code-review/services/CodeReviewService", () => ({
  generateChatTitle: vi.fn(),
}));

/* - Criando o mock dos hooks de contexto - */

vi.mock("@/features/code-review/hooks/useCodeReviewContext");
vi.mock("@/features/authentication/hooks/useAuthenticationContext");
vi.mock("@/features/code-review/hooks/useChatContext");
vi.mock("@/shared/hooks/useThemeContext");

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme: vi.fn(),
  });

  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "John Doe",
    setName: vi.fn(),
    email: "john@email.com",
    setEmail: vi.fn(),
    photo: null,
    setPhoto: vi.fn(),
    userId: "123",
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: null,
    setSelectedChatId: vi.fn(),
    chats: [],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });

  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: "123" } as any },
    error: null as any,
  });

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() =>
                Promise.resolve({ data: null, error: null }),
              ),
            })),
          })),
        })),
      })),
    })),
  } as any);
});

/* - Função para renderizar o componente com Router - */

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/pagina-principal"]}>
      <Routes>
        <Route
          path="/pagina-principal"
          element={<MainPage />}
        />
      </Routes>
    </MemoryRouter>,
  );

/* - Testando o título de boas vindas - */

test("should render the welcome message with the user's first name", () => {
  renderComponent();

  expect(screen.getByText("Vamos ao trabalho, John?")).toBeInTheDocument();
});

/* - Testando os painéis principais - */

test("should render the 'Seu Código' panel", () => {
  renderComponent();

  expect(screen.getByText("Seu Código")).toBeInTheDocument();
});

test("should render the 'Análise IA' panel", () => {
  renderComponent();

  expect(screen.getByText("Análise IA")).toBeInTheDocument();
});

/* - Testando o textarea de código - */

test("should render the code textarea with placeholder text", () => {
  renderComponent();

  expect(
    screen.getByPlaceholderText("Por onde você quer começar?"),
  ).toBeInTheDocument();
});

test("should allow the user to type code in the textarea", async () => {
  renderComponent();

  const textarea = screen.getByPlaceholderText("Por onde você quer começar?");

  await userEvent.type(textarea, "const x = 1;");

  expect(textarea).toHaveValue("const x = 1;");
});

/* - Testando o botão de analisar - */

test("should render the 'Analisar' button", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Analisar/i })).toBeInTheDocument();
});

test("should render the 'Analisar' button as disabled when textarea is empty", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Analisar/i })).toBeDisabled();
});

test("should enable the 'Analisar' button when code is typed", async () => {
  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  expect(screen.getByRole("button", { name: /Analisar/i })).not.toBeDisabled();
});

/* - Testando a chamada ao analyzeCode - */

test("should call analyzeCode with correct data when 'Analisar' is clicked", async () => {
  const analyzeCode = vi.fn(
    (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
  );

  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode,
  });

  vi.mocked(createChat).mockResolvedValueOnce({ id: "new-chat-id" } as any);
  vi.mocked(createPatch).mockResolvedValueOnce([]);
  vi.mocked(generateChatTitle).mockResolvedValue("Novo Chat");
  vi.mocked(updateChat).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  await userEvent.click(screen.getByRole("button", { name: /Analisar/i }));

  await waitFor(() => {
    expect(analyzeCode).toHaveBeenCalledWith("const x = 1;", "new-chat-id");
  });
});

test("should create a new chat when there is no selectedChatId", async () => {
  vi.mocked(createChat).mockResolvedValueOnce({ id: "new-chat-id" } as any);
  vi.mocked(createPatch).mockResolvedValueOnce([]);
  vi.mocked(generateChatTitle).mockResolvedValue("Novo Chat");
  vi.mocked(updateChat).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  await userEvent.click(screen.getByRole("button", { name: /Analisar/i }));

  await waitFor(() => {
    expect(createChat).toHaveBeenCalledWith({ title: "Novo Bate-Papo" });
  });
});

test("should not create a new chat when selectedChatId already exists", async () => {
  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: "existing-chat-id",
    setSelectedChatId: vi.fn(),
    chats: [],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });

  vi.mocked(createPatch).mockResolvedValueOnce([]);
  vi.mocked(generateChatTitle).mockResolvedValue("Novo Chat");

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  await userEvent.click(screen.getByRole("button", { name: /Analisar/i }));

  await waitFor(() => {
    expect(createChat).not.toHaveBeenCalled();
  });
});

/* - Testando o feedback de análise - */

test("should show 'Analisando...' while analyzing", async () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => new Promise(() => {}),
    ),
  });

  vi.mocked(createChat).mockResolvedValueOnce({ id: "new-chat-id" } as any);

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  await userEvent.click(screen.getByRole("button", { name: /Analisar/i }));

  await waitFor(() => {
    expect(screen.getByText("Analisando...")).toBeInTheDocument();
  });
});

/* - Testando a renderização das seções de resultado - */

test("should render error section when errors are returned", () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: ["erro encontrado"],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  renderComponent();

  expect(screen.getByText("Erros Encontrados")).toBeInTheDocument();
  expect(screen.getByText("Erro encontrado")).toBeInTheDocument();
});

test("should render suggestion section when suggestions are returned", () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: ["sugestão encontrada"],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  renderComponent();

  expect(screen.getByText("Sugestões")).toBeInTheDocument();
  expect(screen.getByText("Sugestão encontrada")).toBeInTheDocument();
});

test("should render improvement section when improvements are returned", () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: ["melhoria encontrada"],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  renderComponent();

  expect(screen.getByText("Melhorias")).toBeInTheDocument();
  expect(screen.getByText("Melhoria encontrada")).toBeInTheDocument();
});

test("should render corrected code section when correctedCode is returned", () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "const x = 1;",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  renderComponent();

  expect(screen.getByText("Código Corrigido")).toBeInTheDocument();
});

/* - Testando o botão de copiar - */

test("should call clipboard.writeText when 'Copiar' is clicked", async () => {
  vi.mocked(useCodeReviewContext).mockReturnValue({
    error: [],
    setError: vi.fn(),
    improvement: [],
    setImprovement: vi.fn(),
    suggestion: [],
    setSuggestion: vi.fn(),
    correctedCode: "const x = 1;",
    setCorrectedCode: vi.fn(),
    analyzeCode: vi.fn(
      (_code: string, _chatId: string): Promise<void> => Promise.resolve(),
    ),
  });

  const writeTextMock = vi.fn();
  Object.assign(navigator, {
    clipboard: { writeText: writeTextMock },
  });

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("Por onde você quer começar?"),
    "const x = 1;",
  );

  await userEvent.click(screen.getByRole("button", { name: /Copiar/i }));

  expect(writeTextMock).toHaveBeenCalledWith("const x = 1;");
});
