import { render, screen, waitFor } from "@testing-library/react";
import { ChatTitleModal } from "@/shared";
import userEvent from "@testing-library/user-event";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { updateChat } from "@/features/code-review/services/ChatService";

/* - Criando o mock dos hooks e serviços - */

vi.mock("@/shared/hooks/useThemeContext");

vi.mock("@/features/code-review/services/ChatService", () => ({
  updateChat: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme: vi.fn(),
  });
});

/* - Props padrão para reutilização nos testes - */

const defaultProps = {
  setIsChatTitleModalOpen: vi.fn(),
  chatId: "chat-1",
  onConfirm: vi.fn(),
  currentTitle: "Título Atual",
};

/* - Função para renderizar o componente - */

const renderComponent = (props = defaultProps) =>
  render(<ChatTitleModal {...props} />);

/* - Testando a renderização inicial - */

test("should render the 'Mudar título do chat' title", () => {
  renderComponent();

  expect(screen.getByText("Mudar título do chat")).toBeInTheDocument();
});

test("should render the input with the current title as value", () => {
  renderComponent();

  expect(screen.getByPlaceholderText("Digite o novo título...")).toHaveValue(
    "Título Atual",
  );
});

test("should render the 'Confirmar' button", () => {
  renderComponent();

  expect(
    screen.getByRole("button", { name: /Confirmar/i }),
  ).toBeInTheDocument();
});

test("should render the 'Cancelar' button", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
});

/* - Testando a edição do input - */

test("should update the input value when the user types", async () => {
  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "Novo Título");

  expect(input).toHaveValue("Novo Título");
});

/* - Testando a validação - */

test("should show error message when confirming with empty title", async () => {
  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  expect(screen.getByText("Insira um título válido!")).toBeInTheDocument();
});

test("should show error message when confirming with whitespace-only title", async () => {
  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "   ");
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  expect(screen.getByText("Insira um título válido!")).toBeInTheDocument();
});

test("should not call updateChat when title is empty", async () => {
  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  expect(updateChat).not.toHaveBeenCalled();
});

/* - Testando a confirmação - */

test("should call updateChat with correct data when confirming with valid title", async () => {
  vi.mocked(updateChat).mockResolvedValueOnce({} as any);

  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "Novo Título");
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  await waitFor(() => {
    expect(updateChat).toHaveBeenCalledWith("chat-1", { title: "Novo Título" });
  });
});

test("should call onConfirm after successful update", async () => {
  const onConfirm = vi.fn();
  vi.mocked(updateChat).mockResolvedValueOnce({} as any);

  renderComponent({ ...defaultProps, onConfirm });

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "Novo Título");
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  await waitFor(() => {
    expect(onConfirm).toHaveBeenCalled();
  });
});

test("should call setIsChatTitleModalOpen(false) after successful update", async () => {
  const setIsChatTitleModalOpen = vi.fn();
  vi.mocked(updateChat).mockResolvedValueOnce({} as any);

  renderComponent({ ...defaultProps, setIsChatTitleModalOpen });

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "Novo Título");
  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  await waitFor(() => {
    expect(setIsChatTitleModalOpen).toHaveBeenCalledWith(false);
  });
});

/* - Testando o cancelamento - */

test("should reset input to currentTitle when 'Cancelar' is clicked", async () => {
  renderComponent();

  const input = screen.getByPlaceholderText("Digite o novo título...");

  await userEvent.clear(input);
  await userEvent.type(input, "Título Diferente");
  await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

  expect(defaultProps.setIsChatTitleModalOpen).toHaveBeenCalledWith(false);
});

test("should call setIsChatTitleModalOpen(false) when 'Cancelar' is clicked", async () => {
  const setIsChatTitleModalOpen = vi.fn();

  renderComponent({ ...defaultProps, setIsChatTitleModalOpen });

  await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

  expect(setIsChatTitleModalOpen).toHaveBeenCalledWith(false);
});

test("should call setIsChatTitleModalOpen(false) when the X button is clicked", async () => {
  const setIsChatTitleModalOpen = vi.fn();

  renderComponent({ ...defaultProps, setIsChatTitleModalOpen });

  const buttons = screen.getAllByRole("button");
  const closeButton = buttons[buttons.length - 1];

  await userEvent.click(closeButton);

  expect(setIsChatTitleModalOpen).toHaveBeenCalledWith(false);
});
