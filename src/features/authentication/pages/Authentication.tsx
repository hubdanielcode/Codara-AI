import { motion } from "framer-motion";
import { Code2, Lock, Mail, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { regex, masks } from "@/shared";
import { supabase } from "@/supabase/supabase";
import { createUser } from "../services/authenticationService";

const Authentication = () => {
  /* - Estados do Usuário - */

  const { name, setName, email, setEmail } = useAuthenticationContext();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  /* - Estados de Erro - */

  const [signUpError, setSignUpError] = useState<string>("");

  /* - Estados do checkbox - */

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateAccount();
  };

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setSignUpError("Preencha todos os campos!");
    }

    if (!regex.name.test(name)) {
      return setSignUpError("Nome inválido.");
    }

    if (!regex.email.test(email)) {
      return setSignUpError("Email inválido.");
    }

    if (password.length < 8) {
      return setSignUpError("A senha deve ter no mínimo 8 caracteres.");
    }

    if (password !== confirmPassword) {
      return setSignUpError("As senhas não coincidem.");
    }

    /* - Verificando se os termos foram aceitos - */

    if (!acceptedTerms) {
      return setSignUpError(
        "Você deve aceitar os Termos de Uso e a Política de Privacidade.",
      );
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return setSignUpError(error.message);
    }

    await createUser({ name, email, user_id: data.user!?.id });

    setSignUpError("");
    navigate("/");
  };

  /* - Criando a referência para fechar o erro ao clicar fora - */

  const signUpRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!signUpRef.current) return;

      if (!signUpRef.current.contains(e.target as Node)) {
        setSignUpError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

          <p
            className="text-white font-bold text-3xl mb-2"
            data-testid="create-account-title"
          >
            Criar Conta
          </p>

          <p className="text-zinc-400 font-semibold">
            Comece a revisar seu código agora mesmo.
          </p>
        </div>

        <motion.div
          className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                className="block text-sm font-medium text-zinc-300 mb-2"
                htmlFor="name"
              >
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(masks.name(e.target.value))}
                  placeholder="Seu Nome"
                />
              </div>
            </div>

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

              <p className="text-sm text-zinc-400 mt-2">
                Mínimo de 8 caracteres
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-zinc-300 mb-2"
                htmlFor="confirm-password"
              >
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>

              <p className="text-sm text-zinc-400 mt-2">
                Mínimo de 8 caracteres
              </p>
            </div>

            {/* - Checkbox de termos - */}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-start text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 mt-1 border-zinc-700 cursor-pointer"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />

                <span>
                  Concordo com os{" "}
                  <Link
                    className="text-blue-500 hover:text-blue-400 font-semibold"
                    to="/termos-de-uso"
                  >
                    Termos de Uso{" "}
                  </Link>
                  e{" "}
                  <Link
                    className="text-blue-500 hover:text-blue-400 font-semibold"
                    to="/política-de-privacidade"
                  >
                    Política de Privacidade
                  </Link>
                </span>
              </label>
            </div>

            <motion.button
              className="flex justify-center items-center w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              ref={signUpRef}
              disabled={!acceptedTerms}
            >
              Criar Conta
            </motion.button>
          </form>

          <motion.div
            className="min-h-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {signUpError && (
              <p className="flex items-center justify-center h-12 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 text-center">
                {signUpError}
              </p>
            )}
          </motion.div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Já possui uma conta?{" "}
            <Link
              className="text-blue-500 hover:text-blue-400 transition-colors font-semibold"
              to="/"
            >
              Entrar
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export { Authentication };
