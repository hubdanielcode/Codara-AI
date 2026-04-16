import { motion } from "framer-motion";
import { Code2, Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { regex, masks } from "@/shared";
import { supabase } from "@/supabase/supabase";

const RecoverPassword = () => {
  /* - Estados do Usuário - */

  const [recoverEmail, setRecoverEmail] = useState<string>("");

  /* - Estados de Erro - */

  const [recoverErrorMessage, setRecoverErrorMessage] = useState<string>("");

  const handleRecoverPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!recoverEmail || !regex.email.test(recoverEmail)) {
      setRecoverErrorMessage("Digite um endereço de email válido.");
      return;
    }

    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

    const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
      redirectTo: `${redirectUrl}/`,
    });

    if (error) {
      setRecoverErrorMessage("Falha ao tentar enviar email.");
    }

    alert(
      "Se o email estiver cadastrado, você receberá um link de redefinição de senha.",
    );

    setRecoverEmail("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, stiffness: 250, type: "spring" }}
          >
            <Code2 className="w-8 h-8 text-white" />
          </motion.div>

          <p className="text-white font-bold text-3xl mb-2">Recuperar Senha</p>
          <p className="text-zinc-400 font-semibold">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <motion.div
          className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <form className="space-y-6">
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
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(masks.email(e.target.value))}
                  placeholder="seu@email.com"
                />
              </div>

              <p className="text-sm text-zinc-400 mt-2">
                Digite o email associado à sua conta
              </p>
            </div>

            <motion.button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleRecoverPassword}
            >
              Enviar Link de Recuperação
            </motion.button>
          </form>

          <RouterLink
            className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors mt-6 font-semibold mb-6"
            to="/"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </RouterLink>

          <motion.div
            className="min-h-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {recoverErrorMessage && (
              <p className="flex items-center justify-center h-12 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 text-center">
                {recoverErrorMessage}
              </p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
export { RecoverPassword };
