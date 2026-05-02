import { motion } from "framer-motion";
import { Code2, Mail, Lock } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useEffect, useState, useRef } from "react";
import { masks, regex } from "@/shared";
import { supabase } from "@/supabase/supabase";

const Login = () => {
  /* - Estados do Usuário - */

  const { email, setEmail } = useAuthenticationContext();
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  /* - Estados de Erro - */

  const [signInError, setSignInError] = useState<string>("");

  const navigate = useNavigate();

  /* - Funções - */

  const handleLogin = async () => {
    if (!email || !password) {
      return setSignInError("Preencha todos os campos.");
    }

    if (!regex.email.test(email)) {
      return setSignInError("Email inválido.");
    }

    if (password.length < 8) {
      return setSignInError("A senha conter, pelo menos, 8 caracteres.");
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!rememberMe) {
        window.addEventListener("beforeunload", () => supabase.auth.signOut());
      }

      navigate("/pagina-principal");
    } catch (error) {
      setSignInError("Email ou senha incorretos.");
    }
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:5173/pagina-principal",
      },
    });

    if (error) {
      console.error(error.message);
    }
  };

  /* - Criando a referência para fechar o erro ao clicar fora - */

  const signInRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!signInRef.current) return;

      if (!signInRef.current.contains(e.target as Node)) {
        setSignInError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-center items-center p-4 bg-zinc-950 min-h-screen">
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, stiffness: 250, type: "spring" }}
          >
            <Code2 className="h-8 w-8 text-white" />
          </motion.div>

          <p className="text-white font-bold text-3xl mb-2">Codara AI</p>
          <p className="text-zinc-400 font-semibold">
            Entre para analisar seu código.
          </p>
        </div>

        <motion.div
          className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <form className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-zinc-300 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(masks.email(e.target.value))}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-zinc-300 mb-2"
                htmlFor="password"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-zinc-400 cursor-pointer">
                <input
                  className="mr-2 mt-1 border-zinc-700 cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Lembrar-me
              </label>

              <Link
                to="/recuperar-senha"
                className="text-blue-500 hover:text-blue-400 transition-colors font-semibold"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <motion.button
              className="flex justify-center items-center w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              ref={signInRef}
              onClick={handleLogin}
            >
              Entrar
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-900 text-zinc-500">
                ou continue com
              </span>
            </div>
          </div>

          <motion.button
            className="flex justify-center items-center w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer gap-2 border border-zinc-700 mb-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            onClick={() => signInWithGithub()}
          >
            <FaGithub className="h-5 w-5" />
            Github
          </motion.button>

          <motion.div
            className="min-h-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {signInError && (
              <p className="flex items-center justify-center h-12 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 text-center">
                {signInError}
              </p>
            )}
          </motion.div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Não tem uma conta?{" "}
            <Link
              className="text-blue-500 hover:text-blue-400 transition-colors font-semibold"
              to="/cadastro"
            >
              Cadastre-se
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
export { Login };
