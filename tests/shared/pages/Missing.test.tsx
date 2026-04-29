import { render, screen } from "@testing-library/react";
import { Missing } from "@/shared/pages/Missing";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

/* - Criando o mock do useNavigate - */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o componente com Router - */

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Missing />
    </MemoryRouter>,
  );

/* - Testando a renderização inicial - */

test("should render the 404 error message", () => {
  renderComponent();

  expect(screen.getByText("Erro 404!")).toBeInTheDocument();
});

test("should render the 'Página não encontrada!' message", () => {
  renderComponent();

  expect(screen.getByText("Página não encontrada!")).toBeInTheDocument();
});

test("should render the link to the login page", () => {
  renderComponent();

  expect(screen.getByText("Para a página de Login!")).toBeInTheDocument();
});

/* - Testando a navegação - */

test("should navigate to '/' when the link is clicked", async () => {
  renderComponent();

  await userEvent.click(screen.getByRole("button"));

  expect(mockNavigate).toHaveBeenCalledWith("/");
});
