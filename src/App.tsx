import "react-image-crop/dist/ReactCrop.css";
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
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "./shared/hooks/useThemeContext";
import { AppProviders } from "./shared/providers/AppProviders";
import { PrivacyPolicy } from "./shared/pages/PrivacyPolicy";
import { TermsOfUse } from "./shared/pages/TermsOfUse";
import { Code2 } from "lucide-react";

const AppLayout = () => {
  /* - Puxando do context - */

  const { theme } = useThemeContext();

  /* - Estados para definir o mobile - */

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  /* - Estado da sideBar - */

  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile =
        window.innerWidth < 768 && window.innerHeight > window.innerWidth;
      const landscape =
        window.innerWidth < 1024 && window.innerWidth > window.innerHeight;

      setIsMobile(mobile);
      setIsLandscape(landscape);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`h-dvh w- flex flex-col overflow-hidden ${theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"}`}
    >
      <Header openSideBar={() => setIsSideBarOpen(!isSideBarOpen)} />

      <main
        className={`flex flex-1 min-h-0 ${isMobile ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        <AnimatePresence>
          {isSideBarOpen && (
            <SideBar
              isMobile={isMobile}
              isLandscape={isLandscape}
              onClose={() => setIsSideBarOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="flex flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Outlet context={{ isMobile, isLandscape }} />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingDots, setLoadingDots] = useState<string[]>([]);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev.length > 3) {
          return [];
        } else {
          return [...prev, "."];
        }
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  /* - Quando isLoading - */

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-zinc-950">
        <div className="flex flex-col justify-center items-center p-6 gap-3">
          <div className="flex items-center justify-center h-20 w-20 bg-blue-600 rounded-xl">
            <Code2 className="h-12 w-12 text-white" />
          </div>

          <span className="text-white text-3xl font-bold mt-3">Codara IA</span>

          <motion.span className="flex w-50 whitespace-nowrap text-zinc-600 mt-3 text-lg">
            Carregando sua sessão
            <motion.span className="flex">
              {loadingDots.map((dot, index) => (
                <motion.div
                  key={index}
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {dot}
                </motion.div>
              ))}
            </motion.span>
          </motion.span>
        </div>

        <div className="relative h-2 w-70 bg-zinc-700 rounded-xl">
          <motion.div
            className="absolute top-0 left-0 h-2 bg-blue-600 rounded-xl"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  /* - Quando !isLoading - */

  return (
    <div className="select-none h-full">
      <AppProviders session={session}>
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

          {/* - Rota de Política de Privacidade - */}

          <Route
            path="/política-de-privacidade"
            element={<PrivacyPolicy />}
          />

          {/* - Rota de Termos de Uso - */}

          <Route
            path="/termos-de-uso"
            element={<TermsOfUse />}
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
      </AppProviders>
    </div>
  );
};

export default App;
