import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import {
  PatchContext,
  PatchProvider,
  type PatchContextType,
} from "@/features/code-review/context/PatchContext";
import userEvent from "@testing-library/user-event";
import type { Patch } from "@/features/code-review/types/patch";

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Dados mockados para reutilização nos testes - */

const mockPatches: Patch[] = [
  {
    id: "1",
    user_id: "123",
    chat_id: "chat-1",
    title: "Patch 1",
    had_errors: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    user_id: "123",
    chat_id: "chat-2",
    title: "Patch 2",
    had_errors: true,
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  },
];

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<PatchContextType | null>(PatchContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="updateTitle">{context.updateTitle}</span>
      <span data-testid="date">{context.date}</span>
      <span data-testid="patches">{JSON.stringify(context.patches)}</span>
      <button onClick={() => context.setUpdateTitle("New Title")}>
        Set Update Title
      </button>
      <button onClick={() => context.setDate("2024-01-01")}>Set Date</button>
      <button onClick={() => context.setPatches(mockPatches)}>
        Set Patches
      </button>
    </div>
  );
};

/* - Função para renderizar o componente com Provider - */

const renderComponent = () =>
  render(
    <PatchProvider>
      <TestConsumer />
    </PatchProvider>,
  );

/* - Testando a renderização inicial - */

test("should render children with initial values", () => {
  renderComponent();

  expect(screen.getByTestId("updateTitle")).toHaveTextContent("");
  expect(screen.getByTestId("date")).toHaveTextContent("");
  expect(screen.getByTestId("patches")).toHaveTextContent("[]");
});

/* - Testando as funções de atualização de estado - */

test("should update updateTitle when setUpdateTitle is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Update Title"));

  expect(screen.getByTestId("updateTitle")).toHaveTextContent("New Title");
});

test("should update date when setDate is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Date"));

  expect(screen.getByTestId("date")).toHaveTextContent("2024-01-01");
});

test("should update patches when setPatches is called", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Set Patches"));

  expect(screen.getByTestId("patches")).toHaveTextContent("Patch 1");
  expect(screen.getByTestId("patches")).toHaveTextContent("Patch 2");
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
