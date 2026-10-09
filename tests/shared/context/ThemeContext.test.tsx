import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import {
  ThemeContext,
  ThemeProvider,
  type ThemeContextType,
} from "@/shared/context/ThemeContext";
import userEvent from "@testing-library/user-event";

/* - Criando o mock das utils de tema - */

vi.mock("@/shared/utils/theme", () => ({
  getTheme: vi.fn(() => "Light"),
  saveTheme: vi.fn(),
  applyTheme: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<ThemeContextType | null>(ThemeContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="theme">{context.theme}</span>
      <button onClick={() => context.toggleTheme("Dark")}>Toggle Theme</button>
    </div>
  );
};

/* - Função para renderizar o componente com Provider - */

const renderComponent = () =>
  render(
    <ThemeProvider>
      <TestConsumer />
    </ThemeProvider>,
  );

/* - Testando a renderização inicial - */

test("should render children with initial theme from getTheme", () => {
  renderComponent();

  expect(screen.getByTestId("theme")).toHaveTextContent("Light");
});

/* - Testando o toggleTheme - */

test("should toggle theme from Light to Dark when toggleTheme is called", async () => {
  renderComponent();

  expect(screen.getByTestId("theme")).toHaveTextContent("Light");

  await userEvent.click(screen.getByText("Toggle Theme"));

  expect(screen.getByTestId("theme")).toHaveTextContent("Dark");
});

test("should apply 'dark' class to documentElement when theme is Dark", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Toggle Theme"));

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("should remove 'dark' class from documentElement when theme is Light", async () => {
  document.documentElement.classList.add("dark");

  renderComponent();

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
