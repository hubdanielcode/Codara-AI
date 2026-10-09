import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/features/authentication/pages/ProtectedRoute";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

/* - Session mockada para reutilização nos testes - */

const mockSession = {
  user: { id: "123", email: "john@email.com" },
} as Session;

/* - Função para renderizar o componente com Router - */

const renderComponent = (session: Session | null) =>
  render(
    <MemoryRouter initialEntries={["/pagina-principal"]}>
      <Routes>
        <Route element={<ProtectedRoute session={session} />}>
          <Route
            path="/pagina-principal"
            element={<div>Página Principal</div>}
          />
        </Route>
        <Route
          path="/"
          element={<div>Login</div>}
        />
      </Routes>
    </MemoryRouter>,
  );

/* - Testando o redirecionamento sem sessão - */

test("should redirect to '/' when session is null", () => {
  renderComponent(null);

  expect(screen.getByText("Login")).toBeInTheDocument();
});

/* - Testando a renderização com sessão - */

test("should render the outlet when session is provided", () => {
  renderComponent(mockSession);

  expect(screen.getByText("Página Principal")).toBeInTheDocument();
});
