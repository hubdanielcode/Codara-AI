import { motion } from "framer-motion";
import { ArrowLeft, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

const TermsOfUse = () => {
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
            <ScrollText className="h-5 w-5 text-blue-600" />

            <p
              className={`text-lg font-semibold ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              Termos de Uso
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
              Ao utilizar o{" "}
              <span className="text-blue-600 font-semibold">Codara AI</span>,
              você concorda com os termos descritos abaixo. Leia com atenção
              antes de usar a plataforma.
            </p>
          </motion.div>

          {/* - Seção: Uso aceitável - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              1. Uso aceitável
            </p>

            <ul
              className={`space-y-2 text-sm ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              <li>
                <span className="text-blue-600 mr-2">•</span>A plataforma deve
                ser utilizada apenas para fins de revisão e melhoria de código
              </li>
              <li>
                <span className="text-blue-600 mr-2">•</span>É proibido enviar
                código malicioso, vírus ou conteúdo ilegal
              </li>
              <li>
                <span className="text-blue-600 mr-2">•</span>
                Cada conta é pessoal e intransferível
              </li>
              <li>
                <span className="text-blue-600 mr-2">•</span>É proibido tentar
                burlar os sistemas de segurança da plataforma
              </li>
            </ul>
          </motion.div>

          {/* - Seção: Responsabilidades da IA - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              2. Limitações da IA
            </p>

            <p
              className={`text-sm leading-relaxed ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              O Codara AI utiliza modelos de inteligência artificial para
              analisar código. As sugestões geradas são automatizadas e podem
              conter imprecisões. O usuário é responsável por revisar e validar
              todas as correções antes de aplicá-las em produção.
            </p>
          </motion.div>

          {/* - Seção: Propriedade intelectual - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              3. Propriedade intelectual
            </p>

            <p
              className={`text-sm leading-relaxed ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              O código que você envia continua sendo de sua propriedade. O
              Codara AI não reivindica direitos sobre nenhum código submetido
              para análise. A plataforma em si, incluindo sua interface e
              algoritmos, é propriedade do Codara AI.
            </p>
          </motion.div>

          {/* - Seção: Encerramento de conta - */}

          <motion.div
            className={`rounded-lg p-6 mb-4 border ${theme === "Dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-stone-200 shadow-sm"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p
              className={`text-base font-bold mb-3 ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
            >
              4. Encerramento de conta
            </p>

            <p
              className={`text-sm leading-relaxed ${theme === "Dark" ? "text-zinc-300" : "text-stone-600"}`}
            >
              Você pode encerrar sua conta a qualquer momento. Reservamo-nos o
              direito de suspender contas que violem estes termos, sem aviso
              prévio.
            </p>
          </motion.div>

          {/* - Rodapé dos termos - */}

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

export { TermsOfUse };
