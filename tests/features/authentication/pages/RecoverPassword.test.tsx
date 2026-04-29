import { render, screen } from "@testing-library/react";
import { RecoverPassword } from "@/features/authentication/pages/RecoverPassword";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/supabase/supabase";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

/* - Criando o mock do shared - */

vi.mock("@/shared", () => ({
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  masks: {
    email: vi.fn((value: string) => value),
  },
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Função para renderizar o componente com Router - */

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/recuperar-senha"]}>
      <Routes>
        <Route
          path="/recuperar-senha"
          element={<RecoverPassword />}
        />
        <Route
          path="/"
          element={<div>Login</div>}
        />
      </Routes>
    </MemoryRouter>,
  );

/* - Testando o título - */

test("should render a title with the text 'Recuperar Senha'", () => {
  renderComponent();

  expect(screen.getByText("Recuperar Senha")).toBeInTheDocument();
});

test("should render a subtitle with the text 'Enviaremos um link para redefinir sua senha.'", () => {
  renderComponent();

  expect(
    screen.getByText("Enviaremos um link para redefinir sua senha."),
  ).toBeInTheDocument();
});

/* - Testando o input - */

test("should render the 'Email' input and allow the user to type on it", async () => {
  renderComponent();

  const emailInput = screen.getByPlaceholderText("seu@email.com");

  await userEvent.type(emailInput, "john@email.com");
  expect(emailInput).toHaveValue("john@email.com");
});

/* - Testando o botão de enviar - */

test("should render a button with text 'Enviar Link de Recuperação'", () => {
  renderComponent();

  expect(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  ).toBeInTheDocument();
});

/* - Testando email inválido ou vazio - */

test("should show error when email is empty on submit", async () => {
  renderComponent();

  await userEvent.click(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  );

  expect(
    screen.getByText("Digite um endereço de email válido."),
  ).toBeInTheDocument();
});

test("should show error when email is invalid on submit", async () => {
  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("seu@email.com"),
    "emailinvalido",
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  );

  expect(
    screen.getByText("Digite um endereço de email válido."),
  ).toBeInTheDocument();
});

/* - Testando a chamada ao supabase - */

test("should call supabase.auth.resetPasswordForEmail with correct email on submit", async () => {
  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("seu@email.com"),
    "john@email.com",
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  );

  expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
    "john@email.com",
    { redirectTo: `${import.meta.env.VITE_REDIRECT_URL}/` },
  );
});

/* - Testando o alerta de sucesso - */

test("should show alert on successful password recovery request", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("seu@email.com"),
    "john@email.com",
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  );

  expect(alertMock).toHaveBeenCalledWith(
    "Se o email estiver cadastrado, você receberá um link de redefinição de senha.",
  );

  alertMock.mockRestore();
});

/* - Testando erro do supabase - */

test("should show error when supabase returns an error", async () => {
  vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
    data: {},
    error: { message: "Error" } as any,
  });

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("seu@email.com"),
    "john@email.com",
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Enviar Link de Recuperação/i }),
  );

  expect(screen.getByText("Falha ao tentar enviar email.")).toBeInTheDocument();
});

/* - Testando o link de voltar ao login - */

test("should render a link with text 'Voltar para o login'", () => {
  renderComponent();

  expect(screen.getByText("Voltar para o login")).toBeInTheDocument();
});

test("should redirect the user to login page upon clicking 'Voltar para o login'", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Voltar para o login"));

  expect(screen.getByText("Login")).toBeInTheDocument();
});
