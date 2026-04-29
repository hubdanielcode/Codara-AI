import { render, screen, waitFor } from "@testing-library/react";
import { SideBar } from "@/shared";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useChatContext, usePatchContext } from "@/features/code-review";
import { createChat } from "@/features/code-review/services/ChatService";
import {
  deletePatch,
  getPatches,
} from "@/features/code-review/services/PatchService";
import { supabase } from "@/supabase/supabase";

/* - Criando o mock dos hooks e serviços - */

vi.mock("@/shared/hooks/useThemeContext");
vi.mock("@/features/authentication/hooks/useAuthenticationContext");
vi.mock("@/features/code-review", () => ({
  useChatContext: vi.fn(),
  usePatchContext: vi.fn(),
}));

vi.mock("@/features/code-review/services/ChatService", () => ({
  createChat: vi.fn(),
}));

vi.mock("@/features/code-review/services/PatchService", () => ({
  deletePatch: vi.fn(),
  getPatches: vi.fn(),
}));

vi.mock("@/features/authentication/services/authenticationService", () => ({
  uploadUserPhoto: vi.fn(),
}));

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock("@/shared/components/PhotoCropModal", () => ({
  PhotoCropModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="modal-crop">
      <button onClick={onClose}>Cancelar</button>
    </div>
  ),
}));

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
    chats: [
      {
        id: "chat-1",
        title: "Chat 1",
        user_id: "123",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });

  vi.mocked(usePatchContext).mockReturnValue({
    updateTitle: "",
    setUpdateTitle: vi.fn(),
    date: "",
    setDate: vi.fn(),
    patches: [],
    setPatches: vi.fn(),
  });

  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: "123" } as any },
    error: null as any,
  });
});

/* - Função para renderizar o componente - */

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SideBar />
    </MemoryRouter>,
  );

/* - Testando a renderização inicial - */

test("should render the 'Codara AI' brand name", () => {
  renderComponent();

  expect(screen.getByText("Codara AI")).toBeInTheDocument();
});

test("should render all sidebar options", () => {
  renderComponent();

  expect(screen.getByText("Novo Bate-Papo")).toBeInTheDocument();
  expect(screen.getByText("Histórico de Correções")).toBeInTheDocument();
  expect(screen.getByText("Preferências do Usuário")).toBeInTheDocument();
});

test("should render the user name", () => {
  renderComponent();

  expect(screen.getByText("John Doe")).toBeInTheDocument();
});

test("should render the user email", () => {
  renderComponent();

  expect(screen.getByText("john@email.com")).toBeInTheDocument();
});

test("should render the list of chats", () => {
  renderComponent();

  expect(screen.getByText("Chat 1")).toBeInTheDocument();
});

test("should render user initial when photo is null", () => {
  renderComponent();

  expect(screen.getByText("J")).toBeInTheDocument();
});

test("should render user photo when photo is provided", () => {
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "John Doe",
    setName: vi.fn(),
    email: "john@email.com",
    setEmail: vi.fn(),
    photo: "https://example.com/photo.jpg",
    setPhoto: vi.fn(),
    userId: "123",
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  renderComponent();

  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "https://example.com/photo.jpg",
  );
});

/* - Testando o Novo Bate-Papo - */

test("should call createChat when 'Novo Bate-Papo' is clicked", async () => {
  vi.mocked(createChat).mockResolvedValueOnce({
    id: "chat-2",
    title: "Novo Bate-Papo",
    user_id: "123",
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  });

  renderComponent();

  await userEvent.click(screen.getByText("Novo Bate-Papo"));

  await waitFor(() => {
    expect(createChat).toHaveBeenCalledWith({ title: "Novo Bate-Papo" });
  });
});

/* - Testando o Histórico de Correções - */

test("should open patch history when 'Histórico de Correções' is clicked", async () => {
  vi.mocked(usePatchContext).mockReturnValue({
    updateTitle: "",
    setUpdateTitle: vi.fn(),
    date: "",
    setDate: vi.fn(),
    patches: [
      {
        id: "patch-1",
        user_id: "123",
        chat_id: "chat-1",
        title: "Patch 1",
        had_errors: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ],
    setPatches: vi.fn(),
  });

  vi.mocked(getPatches).mockResolvedValueOnce([]);

  renderComponent();

  await userEvent.click(screen.getByText("Histórico de Correções"));

  await waitFor(() => {
    expect(screen.getByText("Patch 1")).toBeInTheDocument();
  });
});

test("should call getPatches when 'Histórico de Correções' is clicked with a selectedChatId", async () => {
  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: "chat-1",
    setSelectedChatId: vi.fn(),
    chats: [],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });

  vi.mocked(getPatches).mockResolvedValueOnce([]);

  renderComponent();

  await userEvent.click(screen.getByText("Histórico de Correções"));

  await waitFor(() => {
    expect(getPatches).toHaveBeenCalledWith("chat-1");
  });
});

test("should call deletePatch for each patch when 'Limpar Histórico' is clicked", async () => {
  vi.mocked(usePatchContext).mockReturnValue({
    updateTitle: "",
    setUpdateTitle: vi.fn(),
    date: "",
    setDate: vi.fn(),
    patches: [
      {
        id: "patch-1",
        user_id: "123",
        chat_id: "chat-1",
        title: "Patch 1",
        had_errors: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ],
    setPatches: vi.fn(),
  });

  vi.mocked(getPatches).mockResolvedValueOnce([]);
  vi.mocked(deletePatch).mockResolvedValueOnce({} as any);

  renderComponent();

  await userEvent.click(screen.getByText("Histórico de Correções"));

  await waitFor(() => {
    expect(screen.getByText("Limpar Histórico")).toBeInTheDocument();
  });

  await userEvent.click(screen.getByText("Limpar Histórico"));

  await waitFor(() => {
    expect(deletePatch).toHaveBeenCalledWith("patch-1");
  });
});

/* - Testando as Preferências do Usuário - */

test("should toggle user preferences when 'Preferências do Usuário' is clicked", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Preferências do Usuário"));

  await waitFor(() => {
    expect(screen.getByText("Tema Claro ☀️")).toBeInTheDocument();
  });
});

test("should call toggleTheme when the theme option is clicked", async () => {
  const toggleTheme = vi.fn();
  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme,
  });

  renderComponent();

  await userEvent.click(screen.getByText("Preferências do Usuário"));

  await waitFor(() => {
    expect(screen.getByText("Tema Claro ☀️")).toBeInTheDocument();
  });

  await userEvent.click(screen.getByText("Tema Claro ☀️"));

  expect(toggleTheme).toHaveBeenCalledWith("Light");
});

/* - Testando os modais de chat - */

test("should open ChatDeleteModal when the trash button is clicked", async () => {
  renderComponent();

  const groupButtons = screen
    .getAllByRole("button")
    .filter((btn) => btn.className.includes("group"));

  await userEvent.click(groupButtons[0]);

  await waitFor(() => {
    expect(screen.getByTestId("modal-delete")).toBeInTheDocument();
  });
});

test("should open ChatTitleModal when the pen button is clicked", async () => {
  renderComponent();

  const groupButtons = screen
    .getAllByRole("button")
    .filter((btn) => btn.className.includes("group"));

  await userEvent.click(groupButtons[1]);

  await waitFor(() => {
    expect(screen.getByTestId("modal-update")).toBeInTheDocument();
  });
});

/* - Testando a seleção de chat - */

test("should call setSelectedChatId when a chat title is clicked", async () => {
  const setSelectedChatId = vi.fn();
  vi.mocked(useChatContext).mockReturnValue({
    title: "",
    setTitle: vi.fn(),
    selectedChatId: null,
    setSelectedChatId,
    chats: [
      {
        id: "chat-1",
        title: "Chat 1",
        user_id: "123",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ],
    setChats: vi.fn(),
    fetchChats: vi.fn(),
  });

  renderComponent();

  await userEvent.click(screen.getByText("Chat 1"));

  expect(setSelectedChatId).toHaveBeenCalledWith("chat-1");
});
