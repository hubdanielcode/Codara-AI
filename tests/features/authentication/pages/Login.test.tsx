import { render, screen } from "@testing-library/react";
import { Login } from "@/features/authentication/pages/Login";
import { MemoryRouter, Routes, Route } from "react-router";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/supabase/supabase";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(() =>
        Promise.resolve({
          data: {},
          error: null,
        }),
      ),
      signInWithOAuth: vi.fn(() =>
        Promise.resolve({
          data: {},
          error: null,
        }),
      ),
    },
  },
}));

/* - Criando o mock do contexto de autenticação - */

vi.mock("@/features/authentication/hooks/useAuthenticationContext");

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
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "",
    setName: vi.fn(),
    email: "",
    setEmail: vi.fn(),
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });
});

/* - Função para renderizar o componente com Router - */

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/pagina-principal"
          element={<div>Página Principal</div>}
        />
        <Route
          path="/cadastro"
          element={<div>Cadastro</div>}
        />
        <Route
          path="/recuperar-senha"
          element={<div>Recuperar Senha</div>}
        />
      </Routes>
    </MemoryRouter>,
  );

/* - Função para renderizar o componente com contexto preenchido - */

const renderComponentWithFilledContext = () => {
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "John Doe",
    setName: vi.fn(),
    email: "john@email.com",
    setEmail: vi.fn(),
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/pagina-principal"
          element={<div>Página Principal</div>}
        />
        <Route
          path="/cadastro"
          element={<div>Cadastro</div>}
        />
        <Route
          path="/recuperar-senha"
          element={<div>Recuperar Senha</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

/* - Testando o título - */

test("should render a title with the text 'Codara AI'", () => {
  renderComponent();

  expect(screen.getByText("Codara AI")).toBeInTheDocument();
});

test("should render a subtitle with the text 'Entre para analisar seu código.'", () => {
  renderComponent();

  expect(
    screen.getByText("Entre para analisar seu código."),
  ).toBeInTheDocument();
});

/* - Testando os inputs - */

test("should render the 'Email' input and call setEmail when the user types on it", async () => {
  const setEmail = vi.fn();
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "",
    setName: vi.fn(),
    email: "",
    setEmail,
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  renderComponent();

  await userEvent.type(
    screen.getByPlaceholderText("seu@email.com"),
    "john@email.com",
  );

  expect(setEmail).toHaveBeenCalled();
});

test("should render the 'Password' input and allow the user to type on it", async () => {
  renderComponent();

  const passwordInput = screen.getByPlaceholderText("******");

  await userEvent.type(passwordInput, "12345678");
  expect(passwordInput).toHaveValue("12345678");
});

/* - Testando o checkbox de lembrar-me - */

test("should render the 'Lembrar-me' checkbox", () => {
  renderComponent();

  expect(screen.getByRole("checkbox")).toBeInTheDocument();
});

test("should toggle 'Lembrar-me' checkbox when clicked", async () => {
  renderComponent();

  const checkbox = screen.getByRole("checkbox");

  expect(checkbox).not.toBeChecked();
  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});

/* - Testando o link de recuperação de senha - */

test("should render a link with text 'Esqueceu a senha?'", () => {
  renderComponent();

  expect(screen.getByText("Esqueceu a senha?")).toBeInTheDocument();
});

test("should redirect the user to recover password page upon clicking 'Esqueceu a senha?'", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Esqueceu a senha?"));

  expect(screen.getByText("Recuperar Senha")).toBeInTheDocument();
});

/* - Testando o botão de entrar - */

test("should render a button with text 'Entrar'", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
});

/* - Testando se há campos vazios - */

test("should show error if fields are empty on submit", async () => {
  renderComponent();

  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(screen.getByText("Preencha todos os campos.")).toBeInTheDocument();
});

/* - Testando email inválido - */

test("should show error when email is invalid", async () => {
  const setEmail = vi.fn();
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "",
    setName: vi.fn(),
    email: "emailinvalido",
    setEmail,
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  renderComponent();

  await userEvent.type(screen.getByPlaceholderText("******"), "12345678");
  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(screen.getByText("Email inválido.")).toBeInTheDocument();
});

/* - Testando senha curta (< 8 caracteres) - */

test("should show error when password is too short", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getByPlaceholderText("******"), "123");
  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(
    screen.getByText("A senha conter, pelo menos, 8 caracteres."),
  ).toBeInTheDocument();
});

/* - Testando erro de login - */

test("should show error when login fails", async () => {
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
    data: { user: null, session: null },
    error: { message: "Invalid credentials" } as any,
  });

  renderComponentWithFilledContext();

  await userEvent.type(screen.getByPlaceholderText("******"), "12345678");
  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(screen.getByText("Email ou senha incorretos.")).toBeInTheDocument();
});

/* - Testando a chamada ao supabase no login - */

test("should call supabase.auth.signInWithPassword with correct data on submit", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getByPlaceholderText("******"), "12345678");
  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
    email: "john@email.com",
    password: "12345678",
  });
});

/* - Testando o redirecionamento após login bem sucedido - */

test("should redirect the user to main page after successful login", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getByPlaceholderText("******"), "12345678");
  await userEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  expect(screen.getByText("Página Principal")).toBeInTheDocument();
});

/* - Testando o botão de login com Github - */

test("should render a button with text 'Github'", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Github/i })).toBeInTheDocument();
});

test("should call supabase.auth.signInWithOAuth when clicking Github button", async () => {
  renderComponent();

  await userEvent.click(screen.getByRole("button", { name: /Github/i }));

  expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
    provider: "github",
    options: {
      redirectTo: "http://localhost:5173/pagina-principal",
    },
  });
});

/* - Testando o link para página de cadastro - */

test("should render a link with text 'Cadastre-se'", () => {
  renderComponent();

  expect(screen.getByText("Cadastre-se")).toBeInTheDocument();
});

test("should redirect the user to sign up page upon clicking 'Cadastre-se'", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Cadastre-se"));

  expect(screen.getByText("Cadastro")).toBeInTheDocument();
});
