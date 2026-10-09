import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import {
  AuthenticationContext,
  AuthenticationProvider,
  type AuthenticationContextType,
} from "@/features/authentication/context/AuthenticationContext";
import userEvent from "@testing-library/user-event";
import { getUsers } from "@/features/authentication/services/authenticationService";
import type { Session } from "@supabase/supabase-js";

/* - Criando o mock do serviço de autenticação - */

vi.mock("@/features/authentication/services/authenticationService", () => ({
  getUsers: vi.fn(),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Componente auxiliar para acessar o contexto nos testes - */

const TestConsumer = () => {
  const context = useContext<AuthenticationContextType | null>(
    AuthenticationContext,
  );

  if (!context) return <div>No context</div>;

  return (
    <div>
      <span data-testid="name">{context.name}</span>
      <span data-testid="email">{context.email}</span>
      <span data-testid="photo">{context.photo ?? "no-photo"}</span>
      <span data-testid="userId">{context.userId ?? "no-userId"}</span>
      <button onClick={() => context.setName("Jane")}>Set Name</button>
      <button onClick={() => context.setEmail("jane@email.com")}>
        Set Email
      </button>
      <button onClick={() => context.setPhoto("photo.jpg")}>Set Photo</button>
      <button onClick={() => context.clearContextData()}>Clear</button>
    </div>
  );
};

/* - Criando a função para renderizar o componente com Provider - */

const renderComponent = (session: Session | null = null) =>
  render(
    <AuthenticationProvider session={session}>
      <TestConsumer />
    </AuthenticationProvider>,
  );

/* - Criando o mock da sessão para reutilização nos testes - */

const mockSession = {
  user: { id: "123", email: "john@email.com" },
} as Session;

/* - Testando a renderização sem sessão - */

test("should render children without a session", () => {
  renderComponent(null);

  expect(screen.getByTestId("name")).toHaveTextContent("");
  expect(screen.getByTestId("email")).toHaveTextContent("");
  expect(screen.getByTestId("photo")).toHaveTextContent("no-photo");
  expect(screen.getByTestId("userId")).toHaveTextContent("no-userId");
});

/* - Testando a inicialização com sessão - */

test("should set userId from session on initialization", () => {
  vi.mocked(getUsers).mockResolvedValueOnce({ name: "John", user_photo: null });

  renderComponent(mockSession);

  expect(screen.getByTestId("userId")).toHaveTextContent("123");
});

/* - Testando a chamada ao serviço getUsers - */

test("should call getUsers with the correct user id when session is provided", async () => {
  vi.mocked(getUsers).mockResolvedValueOnce({ name: "John", user_photo: null });

  renderComponent(mockSession);

  await waitFor(() => {
    expect(getUsers).toHaveBeenCalledWith("123");
  });
});

test("should not call getUsers when session is null", async () => {
  renderComponent(null);

  await waitFor(() => {
    expect(getUsers).not.toHaveBeenCalled();
  });
});

/* - Testando a atualização dos dados do usuário via getUsers - */

test("should set name and photo from getUsers response", async () => {
  vi.mocked(getUsers).mockResolvedValueOnce({
    name: "John",
    user_photo: "photo.jpg",
  });

  renderComponent(mockSession);

  await waitFor(() => {
    expect(screen.getByTestId("name")).toHaveTextContent("John");
    expect(screen.getByTestId("photo")).toHaveTextContent("photo.jpg");
  });
});

test("should set photo to null when getUsers returns no photo", async () => {
  vi.mocked(getUsers).mockResolvedValueOnce({ name: "John", user_photo: null });

  renderComponent(mockSession);

  await waitFor(() => {
    expect(screen.getByTestId("photo")).toHaveTextContent("no-photo");
  });
});

/* - Testando o tratamento de erro do getUsers - */

test("should handle getUsers error gracefully without crashing", async () => {
  vi.mocked(getUsers).mockRejectedValueOnce(new Error("Fetch error"));

  renderComponent(mockSession);

  await waitFor(() => {
    expect(screen.getByTestId("name")).toHaveTextContent("");
  });
});

/* - Testando as funções de atualização de estado - */

test("should update name when setName is called", async () => {
  vi.mocked(getUsers).mockResolvedValueOnce({ name: "John", user_photo: null });

  renderComponent(mockSession);

  await userEvent.click(screen.getByText("Set Name"));

  expect(screen.getByTestId("name")).toHaveTextContent("Jane");
});

test("should update email when setEmail is called", async () => {
  renderComponent(null);

  await userEvent.click(screen.getByText("Set Email"));

  expect(screen.getByTestId("email")).toHaveTextContent("jane@email.com");
});

test("should update photo when setPhoto is called", async () => {
  renderComponent(null);

  await userEvent.click(screen.getByText("Set Photo"));

  expect(screen.getByTestId("photo")).toHaveTextContent("photo.jpg");
});

/* - Testando a função clearContextData - */

test("should clear name and email when clearContextData is called", async () => {
  vi.mocked(getUsers).mockResolvedValueOnce({ name: "John", user_photo: null });

  renderComponent(mockSession);

  await waitFor(() => {
    expect(screen.getByTestId("name")).toHaveTextContent("John");
  });

  await userEvent.click(screen.getByText("Clear"));

  expect(screen.getByTestId("name")).toHaveTextContent("");
  expect(screen.getByTestId("email")).toHaveTextContent("");
});

/* - Testando o contexto nulo fora do provider - */

test("should render fallback when context is used outside of provider", () => {
  render(<TestConsumer />);

  expect(screen.getByText("No context")).toBeInTheDocument();
});
