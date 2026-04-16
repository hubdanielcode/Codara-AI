import { Route, Routes, Outlet, useNavigate } from "react-router";
import {
  Authentication,
  Login,
  ProtectedRoute,
  RecoverPassword,
} from "./features/authentication";
import { Footer, Header, Missing, SideBar } from "@/shared";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { MainPage } from "./features/code-review/pages/MainPage";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabase";
import { AuthenticationProvider } from "./features/authentication/context/AuthenticationContext";
import { CodeReviewProvider } from "./features/code-review/context/CodeReviewContext";

const AppLayout = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header openSideBar={() => setIsSideBarOpen(!isSideBarOpen)} />

      <main className="flex flex-1">
        {isSideBarOpen && (
          <div className="flex flex-1 bg-zinc-900 text-white">
            <SideBar />
          </div>
        )}

        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const getSession = await supabase.auth.getSession();
        setSession(getSession.data.session);
        console.log("Supabase Session:", getSession.data.session);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();

    const { data: AuthenticationListener } = supabase.auth.onAuthStateChange(
      (e: AuthChangeEvent, session: Session | null) => {
        if (e === "SIGNED_OUT") {
          navigate("/", { replace: true });
        }
        setSession(session);
      },
    );
    return () => {
      AuthenticationListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mx-auto text-5xl font-bold bg-zinc-950">
        <span>Carregando...</span>
      </div>
    );
  }
  return (
    <div className="select-none h-full">
      <AuthenticationProvider session={session}>
        <CodeReviewProvider>
          <Routes>
            {/* - Rota de Login - */}

            <Route
              path="/"
              element={<Login />}
            />

            {/* - Rota de Cadastro - */}

            <Route
              path="/cadastro"
              element={<Authentication />}
            />

            {/* - Rota de Recuperação de Senha - */}

            <Route
              path="/recuperar-senha"
              element={<RecoverPassword />}
            />

            {/* - Rota de Erro - */}

            <Route
              path="*"
              element={<Missing />}
            />

            {/* - Rota do Layout Principal: Protegida !! - */}

            <Route element={<ProtectedRoute session={session} />}>
              <Route element={<AppLayout />}>
                <Route
                  path="/pagina-principal"
                  element={<MainPage />}
                />
              </Route>
            </Route>
          </Routes>
        </CodeReviewProvider>
      </AuthenticationProvider>
    </div>
  );
};

export default App;
