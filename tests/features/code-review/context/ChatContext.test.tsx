import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import {
  ChatContext,
  ChatProvider,
  type ChatContextType,
} from "@/features/code-review/context/ChatContext";
import userEvent from "@testing-library/user-event";
import { getChats } from "@/features/code-review/services/ChatService";
import type { Chat } from "@/features/code-review/types/chat";

/* - Criando o mock do serviço de chat - */

vi.mock("@/features/code-review/services/ChatService", () => ({
  getChats: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

/* - Dados mockados para reutilização nos testes - */

const mockChats: Chat[] = [
  { id: "1", title: "Chat 1" } as Chat,
  { id: "2", title: "Chat 2" } as Chat,
];

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<ChatContextType | null>(ChatContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="title">{context.title}</span>
      <span data-testid="selectedChatId">
        {context.selectedChatId ?? "no-id"}
      </span>
      <span data-testid="chats">{JSON.stringify(context.chats)}</span>
      <button onClick={() => context.setTitle("New Title")}>Set Title</button>
      <button onClick={() => context.setSelectedChatId("abc")}>
        Set Selected Chat
      </button>
      <button onClick={() => context.setSelectedChatId(null)}>
        Clear Selected Chat
      </button>
      <button onClick={() => context.setChats(mockChats)}>Set Chats</button>
      <button onClick={() => context.fetchChats()}>Fetch Chats</button>
    </div>
  );
};

/* - Função para renderizar o componente com Provider - */

const renderComponent = () =>
  render(
    <ChatProvider>
      <TestConsumer />
    </ChatProvider>,
  );

/* - Testando a renderização inicial - */

test("should render children with initial values", async () => {
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId("title")).toHaveTextContent("");
    expect(screen.getByTestId("selectedChatId")).toHaveTextContent("no-id");
    expect(screen.getByTestId("chats")).toHaveTextContent("[]");
  });
});

/* - Testando a chamada ao fetchChats na montagem - */

test("should call getChats on mount", async () => {
  vi.mocked(getChats).mockResolvedValueOnce(mockChats);

  renderComponent();

  await waitFor(() => {
    expect(getChats).toHaveBeenCalledTimes(1);
  });
});

test("should populate chats after fetchChats on mount", async () => {
  vi.mocked(getChats).mockResolvedValueOnce(mockChats);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId("chats")).toHaveTextContent("Chat 1");
  });
});

/* - Testando o fetchChats manual - */

test("should refetch chats when fetchChats is called manually", async () => {
  vi.mocked(getChats).mockResolvedValue(mockChats);

  renderComponent();

  await waitFor(() => expect(getChats).toHaveBeenCalledTimes(1));

  await userEvent.click(screen.getByText("Fetch Chats"));

  await waitFor(() => {
    expect(getChats).toHaveBeenCalledTimes(2);
  });
});

/* - Testando as funções de atualização de estado - */

test("should update title when setTitle is called", async () => {
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => expect(getChats).toHaveBeenCalled());

  await userEvent.click(screen.getByText("Set Title"));

  expect(screen.getByTestId("title")).toHaveTextContent("New Title");
});

test("should update chats when setChats is called", async () => {
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => expect(getChats).toHaveBeenCalled());

  await userEvent.click(screen.getByText("Set Chats"));

  expect(screen.getByTestId("chats")).toHaveTextContent("Chat 1");
});

/* - Testando o selectedChatId com localStorage - */

test("should initialize selectedChatId from localStorage", async () => {
  localStorage.setItem("selectedChatId", "stored-id");
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId("selectedChatId")).toHaveTextContent("stored-id");
  });
});

test("should save selectedChatId to localStorage when set", async () => {
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => expect(getChats).toHaveBeenCalled());

  await userEvent.click(screen.getByText("Set Selected Chat"));

  expect(localStorage.getItem("selectedChatId")).toBe("abc");
  expect(screen.getByTestId("selectedChatId")).toHaveTextContent("abc");
});

test("should remove selectedChatId from localStorage when set to null", async () => {
  localStorage.setItem("selectedChatId", "abc");
  vi.mocked(getChats).mockResolvedValueOnce([]);

  renderComponent();

  await waitFor(() => expect(getChats).toHaveBeenCalled());

  await userEvent.click(screen.getByText("Clear Selected Chat"));

  expect(localStorage.getItem("selectedChatId")).toBeNull();
  expect(screen.getByTestId("selectedChatId")).toHaveTextContent("no-id");
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
