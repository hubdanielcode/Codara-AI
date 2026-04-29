import { render, screen, waitFor } from "@testing-library/react";
import { ChatDeleteModal } from "@/shared/ui/ChatDeleteModal";
import userEvent from "@testing-library/user-event";
import { useChatContext } from "@/features/code-review";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { deleteChat } from "@/features/code-review/services/ChatService";

/* - Criando o mock dos hooks e serviços - */

vi.mock("@/features/code-review", () => ({
  useChatContext: vi.fn(),
}));

vi.mock("@/shared/hooks/useThemeContext");

vi.mock("@/features/code-review/services/ChatService", () => ({
  deleteChat: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme: vi.fn(),
  });

  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: null,
    setSelectedChatId: vi.fn(),
    chats: [
      {
        id: "chat-1",
        title: "Chat 1",
        user_id: "123",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "chat-2",
        title: "Chat 2",
        user_id: "123",
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });
});

/* - Props padrão para reutilização nos testes - */

const defaultProps = {
  setIsChatDeleteModalOpen: vi.fn(),
  chatId: "chat-1",
  onConfirm: vi.fn(),
};

/* - Função para renderizar o componente - */

const renderComponent = (props = defaultProps) =>
  render(<ChatDeleteModal {...props} />);

/* - Testando a renderização inicial - */

test("should render the 'Apagar chat' title", () => {
  renderComponent();

  expect(screen.getByText("Apagar chat")).toBeInTheDocument();
});

test("should render the confirmation message", () => {
  renderComponent();

  expect(
    screen.getByText("Tem certeza que deseja excluir esse chat?"),
  ).toBeInTheDocument();
});

test("should render the 'Apagar' button", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Apagar/i })).toBeInTheDocument();
});

test("should render the 'Cancelar' button", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
});

/* - Testando o fechamento do modal - */

test("should call setIsChatDeleteModalOpen(false) when 'Cancelar' is clicked", async () => {
  const setIsChatDeleteModalOpen = vi.fn();

  renderComponent({ ...defaultProps, setIsChatDeleteModalOpen });

  await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

  expect(setIsChatDeleteModalOpen).toHaveBeenCalledWith(false);
});

test("should call setIsChatDeleteModalOpen(false) when the X button is clicked", async () => {
  const setIsChatDeleteModalOpen = vi.fn();

  renderComponent({ ...defaultProps, setIsChatDeleteModalOpen });

  const buttons = screen.getAllByRole("button");
  const closeButton = buttons[buttons.length - 1];

  await userEvent.click(closeButton);

  expect(setIsChatDeleteModalOpen).toHaveBeenCalledWith(false);
});

/* - Testando a exclusão do chat - */

test("should call deleteChat with the correct chatId when 'Apagar' is clicked", async () => {
  vi.mocked(deleteChat).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.click(screen.getByRole("button", { name: /Apagar/i }));

  await waitFor(() => {
    expect(deleteChat).toHaveBeenCalledWith("chat-1");
  });
});

test("should remove selectedChatId from localStorage after deletion", async () => {
  localStorage.setItem("selectedChatId", "chat-1");
  vi.mocked(deleteChat).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.click(screen.getByRole("button", { name: /Apagar/i }));

  await waitFor(() => {
    expect(localStorage.getItem("selectedChatId")).toBeNull();
  });
});

test("should filter out the deleted chat from chats list", async () => {
  const setChats = vi.fn();
  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: null,
    setSelectedChatId: vi.fn(),
    chats: [
      {
        id: "chat-1",
        title: "Chat 1",
        user_id: "123",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "chat-2",
        title: "Chat 2",
        user_id: "123",
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ],
    setChats,
    fetchChats: vi.fn(),
  });

  vi.mocked(deleteChat).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.click(screen.getByRole("button", { name: /Apagar/i }));

  await waitFor(() => {
    expect(setChats).toHaveBeenCalledWith([
      {
        id: "chat-2",
        title: "Chat 2",
        user_id: "123",
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ]);
  });
});

test("should call onConfirm after deletion", async () => {
  const onConfirm = vi.fn();
  vi.mocked(deleteChat).mockResolvedValueOnce({} as any);

  renderComponent({ ...defaultProps, onConfirm });

  await userEvent.click(screen.getByRole("button", { name: /Apagar/i }));

  await waitFor(() => {
    expect(onConfirm).toHaveBeenCalled();
  });
});

test("should call setIsChatDeleteModalOpen(false) after deletion", async () => {
  const setIsChatDeleteModalOpen = vi.fn();
  vi.mocked(deleteChat).mockResolvedValueOnce({} as any);

  renderComponent({ ...defaultProps, setIsChatDeleteModalOpen });

  await userEvent.click(screen.getByRole("button", { name: /Apagar/i }));

  await waitFor(() => {
    expect(setIsChatDeleteModalOpen).toHaveBeenCalledWith(false);
  });
});
