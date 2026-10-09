import { render, screen } from "@testing-library/react";
import { Footer } from "@/shared";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

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

const renderComponent = () => render(<Footer />);

/* - Testando a renderização inicial - */

test("should render the 'Codara AI' brand name", () => {
  renderComponent();

  expect(screen.getByText("Codara AI")).toBeInTheDocument();
});

test("should render the current year in the footer", () => {
  renderComponent();

  const currentYear = new Date().getFullYear().toString();

  expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
  expect(screen.getByRole("contentinfo")).toHaveTextContent(currentYear);
});
