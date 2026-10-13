import { motion } from "motion/react";
import { CheckCircle2, Code2, Lock, Mail, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { regex, masks } from "@/shared";
import { supabase } from "@/supabase/supabase";

const Authentication = () => {
  /* - Estados do Usuário - */

  const { name, setName, email, setEmail } = useAuthenticationContext();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  /* - Estados de Erro - */

  const [signUpError, setSignUpError] = useState<string>("");

  /* - Estados do envio e da confirmação por e-mail - */

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendMessage, setResendMessage] = useState<string>("");

  /* - Estados do checkbox - */

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateAccount();
  };

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setSignUpError("Preencha todos os campos!");
    }

    const cleanName = name.trim();

    if (!regex.name.test(cleanName)) {
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: cleanName },
        },
      });

      if (error) {
        return setSignUpError(error.message);
      }

      setSignUpError("");
      setEmailSent(true);
      setResendCooldown(60);
    } catch {
      setSignUpError("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* - Reenviar o e-mail de confirmação - */

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      return setResendMessage(error.message);
    }

    setResendMessage("E-mail reenviado!");
    setResendCooldown(60);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

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

  /* - Tela exibida depois do cadastro: pede para confirmar o e-mail - */

  if (emailSent) {
    return (
      <div className="flex justify-center items-center p-4 bg-zinc-950 min-h-screen">
        <motion.div
          className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          data-testid="email-confirmation"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, stiffness: 250, type: "spring" }}
          >
            <Mail className="h-8 w-8 text-white" />
          </motion.div>

          <p className="text-white font-bold text-2xl mb-2">Confirme seu e-mail</p>

          <p className="text-zinc-400 mb-4">
            Enviamos um link de confirmação para <span className="text-white font-semibold break-all">{email}</span>.
          </p>

          <div className="flex items-start gap-3 text-left bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
            <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-300">
              Abra seu e-mail e clique no link para ativar sua conta. Se não encontrar, olhe também a caixa de spam.
            </p>
          </div>

          <button
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Reenviar e-mail em ${resendCooldown}s` : "Reenviar e-mail"}
          </button>

          <p className="min-h-5 text-sm text-zinc-400 mb-3">{resendMessage}</p>

          <Link
            className="text-blue-500 hover:text-blue-400 transition-colors font-semibold text-sm"
            to="/"
          >
            Já confirmei, ir para o login
          </Link>
        </motion.div>
      </div>
    );
  }

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

          <p className="text-zinc-400 font-semibold">Comece a revisar seu código agora mesmo.</p>
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

              <p className="text-sm text-zinc-400 mt-2">Mínimo de 8 caracteres</p>
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

              <p className="text-sm text-zinc-400 mt-2">Mínimo de 8 caracteres</p>
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
              disabled={!acceptedTerms || isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar Conta"}
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
