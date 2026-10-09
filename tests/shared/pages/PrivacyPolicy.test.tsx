import { render, screen } from "@testing-library/react";
import { PrivacyPolicy } from "@/shared/pages/PrivacyPolicy";
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

/* - Função para renderizar o componente com Router - */

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PrivacyPolicy />
    </MemoryRouter>,
  );

/* - Testando a renderização inicial - */

test("should render the 'Política de Privacidade' title", () => {
  renderComponent();

  expect(screen.getByText("Política de Privacidade")).toBeInTheDocument();
});

test("should render the 'Voltar' button", () => {
  renderComponent();

  expect(screen.getByText("Voltar")).toBeInTheDocument();
});

test("should render section '1. Dados que coletamos'", () => {
  renderComponent();

  expect(screen.getByText("1. Dados que coletamos")).toBeInTheDocument();
});

test("should render section '2. Como usamos seus dados'", () => {
  renderComponent();

  expect(screen.getByText("2. Como usamos seus dados")).toBeInTheDocument();
});

test("should render section '3. Segurança dos dados'", () => {
  renderComponent();

  expect(screen.getByText("3. Segurança dos dados")).toBeInTheDocument();
});

test("should render section '4. Seus direitos'", () => {
  renderComponent();

  expect(screen.getByText("4. Seus direitos")).toBeInTheDocument();
});

test("should render the footer text", () => {
  renderComponent();

  expect(
    screen.getByText("Última atualização: Abril de 2026 — Codara AI"),
  ).toBeInTheDocument();
});

/* - Testando a navegação - */

test("should call navigate(-1) when 'Voltar' is clicked", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Voltar"));

  expect(mockNavigate).toHaveBeenCalledWith(-1);
});
