import { render, screen } from "@testing-library/react";
import { Header } from "@/shared";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

/* - Criando o mock do useNavigate - */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* - Criando o mock do useThemeContext - */

vi.mock("@/shared/hooks/useThemeContext");

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme: vi.fn(),
  });
});

/* - Função para renderizar o componente - */

const renderComponent = (openSideBar = vi.fn()) =>
  render(
    <MemoryRouter>
      <Header openSideBar={openSideBar} />
    </MemoryRouter>,
  );

/* - Testando a renderização inicial - */

test("should render the 'Codara AI' brand name", () => {
  renderComponent();

  expect(screen.getByText("Codara AI")).toBeInTheDocument();
});

test("should render the current date in the header", () => {
  renderComponent();

  const today = new Date().toLocaleDateString("pt-BR");

  expect(screen.getByText(new RegExp(today))).toBeInTheDocument();
});

/* - Testando as ações dos botões - */

test("should call openSideBar when the menu button is clicked", async () => {
  const openSideBar = vi.fn();

  renderComponent(openSideBar);

  const buttons = screen.getAllByRole("button");
  await userEvent.click(buttons[0]);

  expect(openSideBar).toHaveBeenCalled();
});

test("should navigate to '/' when the logout button is clicked", async () => {
  renderComponent();

  const buttons = screen.getAllByRole("button");
  await userEvent.click(buttons[1]);

  expect(mockNavigate).toHaveBeenCalledWith("/");
});
