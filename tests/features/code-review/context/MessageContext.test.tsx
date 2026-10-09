import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import {
  MessageContext,
  MessageProvider,
  type MessageContextType,
} from "@/features/code-review/context/MessageContext";
import userEvent from "@testing-library/user-event";

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<MessageContextType | null>(MessageContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="content">{context.content}</span>
      <button onClick={() => context.setContent("Hello World")}>
        Set Content
      </button>
      <button onClick={() => context.clearContextData()}>Clear</button>
    </div>
  );
};

/* - Função para renderizar o componente com Provider - */

const renderComponent = () =>
  render(
    <MessageProvider>
      <TestConsumer />
    </MessageProvider>,
  );

/* - Testando a renderização inicial - */

test("should render children with empty content initially", () => {
  renderComponent();

  expect(screen.getByTestId("content")).toHaveTextContent("");
});

/* - Testando as funções de atualização de estado - */

test("should update content when setContent is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Content"));

  expect(screen.getByTestId("content")).toHaveTextContent("Hello World");
});

/* - Testando a função clearContextData - */

test("should clear content when clearContextData is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Content"));

  expect(screen.getByTestId("content")).toHaveTextContent("Hello World");

  await userEvent.click(screen.getByText("Clear"));

  expect(screen.getByTestId("content")).toHaveTextContent("");
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
