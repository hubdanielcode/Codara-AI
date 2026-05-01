import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

const PrivacyPolicy = () => {
  /* - Puxando do context - */

  const { theme } = useThemeContext();

  /* - Funções - */

  const navigate = useNavigate();

  return (
    <>
      <div
        className={`flex flex-col h-screen w-full overflow-hidden ${theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"}`}
      >
        {/* - Cabeçalho - */}

        <motion.div
          className={`flex items-center gap-4 px-8 py-4 border-b shrink-0 ${theme === "Dark" ? "border-zinc-700" : "border-stone-300"}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className={`flex items-center gap-2 font-semibold text-sm cursor-pointer ${theme === "Dark" ? "text-zinc-400 hover:text-white" : "text-stone-500 hover:text-stone-800"}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </motion.button>

          <div className="flex items-center gap-2 ml-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <p
              className={`text-lg font-semibold ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              Política de Privacidade
            </p>
          </div>
        </motion.div>

        {/* - Conteúdo - */}

        <motion.div
          className="flex flex-col flex-1 overflow-y-auto px-8 py-6 max-w-4xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* - Introdução - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p
              className={`text-sm leading-relaxed ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              A sua privacidade é importante para nós. Esta política descreve
              como o{" "}
              <span className="text-blue-600 font-semibold">Codara AI</span>{" "}
              coleta, usa e protege as suas informações pessoais ao utilizar
              nossa plataforma de revisão de código com inteligência artificial.
            </p>
          </motion.div>

          {/* - Seção: Coleta de dados - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              1. Dados que coletamos
            </p>

            <ul
              className={`space-y-2 text-sm ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Endereço de e-mail utilizado no cadastro
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Códigos enviados para análise pela IA
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Histórico de conversas e correções realizadas
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Dados de uso da plataforma para melhorias do serviço
              </li>
            </ul>
          </motion.div>

          {/* - Seção: Uso dos dados - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              2. Como usamos seus dados
            </p>

            <ul
              className={`space-y-2 text-sm ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Para fornecer o serviço de revisão de código com IA
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Para salvar seu histórico de análises e permitir revisitá-las
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Para melhorar continuamente a qualidade das respostas da IA
              </li>

              <li>
                <span className="text-blue-600 mr-2">•</span>
                Nunca vendemos ou compartilhamos seus dados com terceiros
              </li>
            </ul>
          </motion.div>

          {/* - Seção: Segurança - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              3. Segurança dos dados
            </p>

            <p
              className={`text-sm leading-relaxed ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              Utilizamos o Supabase como infraestrutura de banco de dados, que
              conta com criptografia em repouso e em trânsito, autenticação
              segura e políticas de controle de acesso por linha (RLS). Seus
              dados são acessíveis apenas por você.
            </p>
          </motion.div>

          {/* - Seção: Seus direitos - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              4. Seus direitos
            </p>

            <ul
              className={`space-y-2 text-sm ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Solicitar a exclusão de todos os seus dados a qualquer momento
              </li>
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Acessar e exportar seu histórico de análises
              </li>
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Corrigir informações incorretas da sua conta
              </li>
            </ul>
          </motion.div>

          {/* - Rodapé da política - */}

          <motion.p
            className={`text-xs text-center mt-2 mb-6 ${theme === "Dark" ? "text-zinc-500" : "text-stone-400"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Última atualização: Abril de 2026 — Codara AI
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export { PrivacyPolicy };
