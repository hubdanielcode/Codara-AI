import { act, render, screen } from "@testing-library/react";
import { Authentication } from "@/features/authentication/pages/Authentication";
import { MemoryRouter, Routes, Route } from "react-router";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/supabase/supabase";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: "123" } },
          error: null,
        }),
      ),
      resend: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

/* - Criando o mock do contexto de autenticação - */

vi.mock("@/features/authentication/hooks/useAuthenticationContext");

/* - Criando o mock do shared - */

vi.mock("@/shared", () => ({
  regex: {
    name: /^[a-zA-ZÀ-ÿ\s]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  masks: {
    name: vi.fn((value: string) => value),
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
    <MemoryRouter initialEntries={["/sign-up"]}>
      <Routes>
        <Route
          path="/sign-up"
          element={<Authentication />}
        />
        <Route
          path="/"
          element={<div>Home</div>}
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
    <MemoryRouter initialEntries={["/sign-up"]}>
      <Routes>
        <Route
          path="/sign-up"
          element={<Authentication />}
        />
        <Route
          path="/"
          element={<div>Home</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

/* - Preenche as senhas, aceita os termos e envia o formulário - */

const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup> = userEvent.setup()) => {
  await user.type(screen.getAllByPlaceholderText("••••••")[0], "12345678");
  await user.type(screen.getAllByPlaceholderText("••••••")[1], "12345678");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: /Criar Conta/i }));
};

/* - Testando o título - */

test("should render a title with the text 'Criar Conta'", () => {
  renderComponent();

  expect(screen.getByTestId("create-account-title")).toBeInTheDocument();
});

test("should render a subtitle with the text 'Comece a revisar seu código agora mesmo.'", () => {
  renderComponent();

  expect(screen.getByText("Comece a revisar seu código agora mesmo.")).toBeInTheDocument();
});

/* - Testando os inputs - */

test("should render the 'Name' input and call setName when the user types on it", async () => {
  const setName = vi.fn();
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "",
    setName,
    email: "",
    setEmail: vi.fn(),
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  renderComponent();

  await userEvent.type(screen.getByPlaceholderText("Seu Nome"), "John Doe");

  expect(setName).toHaveBeenCalled();
});

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

  await userEvent.type(screen.getByPlaceholderText("seu@email.com"), "john@email.com");

  expect(setEmail).toHaveBeenCalled();
});

test("should render the 'Password' input and allow the user to type on it", async () => {
  renderComponent();

  const passwordInput = screen.getAllByPlaceholderText("••••••")[0];

  await userEvent.type(passwordInput, "12345678");
  expect(passwordInput).toHaveValue("12345678");
});

test("should render the 'Confirm Password' input and allow the user to type on it", async () => {
  renderComponent();

  const confirmPasswordInput = screen.getAllByPlaceholderText("••••••")[1];

  await userEvent.type(confirmPasswordInput, "12345678");
  expect(confirmPasswordInput).toHaveValue("12345678");
});

/* - Testando o checkbox de termos - */

test("should render the terms and privacy policy checkbox", () => {
  renderComponent();

  expect(screen.getByRole("checkbox")).toBeInTheDocument();
});

test("should render links for 'Termos de Uso' and 'Política de Privacidade'", () => {
  renderComponent();

  expect(screen.getByText("Termos de Uso")).toBeInTheDocument();
  expect(screen.getByText("Política de Privacidade")).toBeInTheDocument();
});

/* - Testando o botão de cadastro - */

test("should render a disabled submit button when terms are not accepted", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Criar Conta/i })).toBeDisabled();
});

test("should enable submit button when terms are accepted", async () => {
  renderComponent();

  await userEvent.click(screen.getByRole("checkbox"));

  expect(screen.getByRole("button", { name: /Criar Conta/i })).not.toBeDisabled();
});

/* - Testando se há campos vazios - */

test("should show error if fields are empty on submit", async () => {
  renderComponent();

  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

  expect(screen.getByText("Preencha todos os campos!")).toBeInTheDocument();
});

/* - Testando senha curta (< 8 caracteres) - */

test("should show error when password is too short", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getAllByPlaceholderText("••••••")[0], "123");
  await userEvent.type(screen.getAllByPlaceholderText("••••••")[1], "123");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

  expect(screen.getByText("A senha deve ter no mínimo 8 caracteres.")).toBeInTheDocument();
});

/* - Testando se as senhas coincidem - */

test("should show error when passwords do not match", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getAllByPlaceholderText("••••••")[0], "12345678");
  await userEvent.type(screen.getAllByPlaceholderText("••••••")[1], "87654321");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

  expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
});

/* - Testando a chamada ao supabase no cadastro - */

test("should call supabase.auth.signUp with correct data on submit", async () => {
  renderComponentWithFilledContext();

  await userEvent.type(screen.getAllByPlaceholderText("••••••")[0], "12345678");
  await userEvent.type(screen.getAllByPlaceholderText("••••••")[1], "12345678");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

  expect(supabase.auth.signUp).toHaveBeenCalledWith({
    email: "john@email.com",
    password: "12345678",
    options: {
      emailRedirectTo: window.location.origin,
      data: { name: "John Doe" },
    },
  });
});

test("should trim the name before sending it to supabase", async () => {
  vi.mocked(useAuthenticationContext).mockReturnValue({
    name: "John Doe ",
    setName: vi.fn(),
    email: "john@email.com",
    setEmail: vi.fn(),
    photo: null,
    setPhoto: vi.fn(),
    userId: null,
    setUserId: vi.fn(),
    clearContextData: vi.fn(),
  });

  renderComponent();
  await fillAndSubmit();

  expect(supabase.auth.signUp).toHaveBeenCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({ data: { name: "John Doe" } }),
    }),
  );
});

/* - Testando o estado de carregamento do botão - */

test("should show 'Criando conta...' and disable the button while submitting", async () => {
  vi.mocked(supabase.auth.signUp).mockImplementationOnce(() => new Promise(() => {}) as never);

  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(screen.getByRole("button", { name: "Criando conta..." })).toBeDisabled();
});

/* - Testando a tela de confirmação de e-mail - */

test("should show the email confirmation screen after a successful signup", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(await screen.findByTestId("email-confirmation")).toBeInTheDocument();
  expect(screen.getByText("Confirme seu e-mail")).toBeInTheDocument();
  expect(screen.getByText("john@email.com")).toBeInTheDocument();
});

test("should hide the signup form after a successful signup", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  await screen.findByTestId("email-confirmation");

  expect(screen.queryByTestId("create-account-title")).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText("Seu Nome")).not.toBeInTheDocument();
});

test("should not redirect to the home page after a successful signup", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  await screen.findByTestId("email-confirmation");

  expect(screen.queryByText("Home")).not.toBeInTheDocument();
});

test("should tell the user to check the spam folder", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(await screen.findByText(/caixa de spam/i)).toBeInTheDocument();
});

test("should redirect to the home page upon clicking 'Já confirmei, ir para o login'", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  await userEvent.click(await screen.findByText("Já confirmei, ir para o login"));

  expect(screen.getByText("Home")).toBeInTheDocument();
});

/* - Testando os erros do cadastro - */

test("should show the supabase error and not the confirmation screen when signup fails", async () => {
  vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
    data: { user: null, session: null },
    error: { message: "User already registered" },
  } as never);

  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(await screen.findByText("User already registered")).toBeInTheDocument();
  expect(screen.queryByTestId("email-confirmation")).not.toBeInTheDocument();
});

test("should show a generic error when signUp throws", async () => {
  vi.mocked(supabase.auth.signUp).mockRejectedValueOnce(new Error("network"));

  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(await screen.findByText("Não foi possível criar a conta. Tente novamente.")).toBeInTheDocument();
  expect(screen.queryByTestId("email-confirmation")).not.toBeInTheDocument();
});

/* - Testando o reenvio do e-mail de confirmação - */

test("should disable the resend button with a countdown right after signup", async () => {
  renderComponentWithFilledContext();
  await fillAndSubmit();

  expect(await screen.findByRole("button", { name: "Reenviar e-mail em 60s" })).toBeDisabled();
});

test("should enable the resend button after the 60s cooldown", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  try {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderComponentWithFilledContext();
    await fillAndSubmit(user);
    await screen.findByTestId("email-confirmation");

    for (let i = 0; i < 60; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByRole("button", { name: "Reenviar e-mail" })).toBeEnabled();
  } finally {
    vi.useRealTimers();
  }
});

test("should call supabase.auth.resend and show a success message", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  try {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderComponentWithFilledContext();
    await fillAndSubmit(user);
    await screen.findByTestId("email-confirmation");

    for (let i = 0; i < 60; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    await user.click(screen.getByRole("button", { name: "Reenviar e-mail" }));

    expect(supabase.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "john@email.com",
      options: { emailRedirectTo: window.location.origin },
    });
    expect(await screen.findByText("E-mail reenviado!")).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

test("should show the error message when resending the email fails", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  try {
    vi.mocked(supabase.auth.resend).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "email rate limit exceeded" },
    } as never);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderComponentWithFilledContext();
    await fillAndSubmit(user);
    await screen.findByTestId("email-confirmation");

    for (let i = 0; i < 60; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    await user.click(screen.getByRole("button", { name: "Reenviar e-mail" }));

    expect(await screen.findByText("email rate limit exceeded")).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

/* - Testando o link para página de login - */

test("should render a link with text 'Entrar'", () => {
  renderComponent();

  expect(screen.getByText("Entrar")).toBeInTheDocument();
});

test("should redirect the user to home page upon clicking 'Entrar'", async () => {
  renderComponent();

  await userEvent.click(screen.getByText("Entrar"));

  expect(screen.getByText("Home")).toBeInTheDocument();
});
