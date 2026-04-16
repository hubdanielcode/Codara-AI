import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Code2,
  Lightbulb,
  Play,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useCodeReviewContext } from "../hooks/useCodeReviewContext";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";

const MainPage = () => {
  const { error, suggestion, improvement, correctedCode, analyzeCode } =
    useCodeReviewContext();

  const { name } = useAuthenticationContext();

  /* - Estados do código - */

  const [isAnalyzing, setIsAnalyzing] = useState<boolean | null>(null);
  const [code, setCode] = useState<string>("");

  /* - Funções - */

  const handleAnalyze = async () => {
    if (!code.trim()) {
      return;
    }
    setIsAnalyzing(true);
    try {
      await analyzeCode(code);
    } catch (error) {
      console.log("Erro ao ler seu código:", error);
      console.log("correctedCode:", correctedCode);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen min-w-full bg-zinc-900">
        <motion.p
          className="text-white text-4xl mx-auto my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          Vamos ao trabalho, {name.split(" ")[0]}?
        </motion.p>

        {/* - Tela dividida - */}

        <div className="flex flex-1">
          {/* - Lado esquerdo: Meu código - */}

          <motion.div
            className="flex flex-col flex-1 px-4 py-3 bg-zinc-900"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex w-full items-center justify-between h-15 border-b-2 border-zinc-700 px-4 py-2">
              <div className="flex items-center">
                <Code2 className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-lg font-semibold text-white">Seu Código</p>
              </div>

              <motion.button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 px-6 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code.trim()}
              >
                <Play className="h-5 w-5 text-white" />
                {isAnalyzing ? "Analisando..." : "Analisar"}
              </motion.button>
            </div>

            <textarea
              className="flex-1 bg-black rounded-lg resize-none my-6 mx-4 p-4 text-white placeholder:text-zinc-300 text-lg focus:outline-none"
              placeholder="Por onde você quer começar?"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </motion.div>

          {/* - Lado direito: Resposta do Codara - */}

          <motion.div
            className="flex flex-col flex-1 px-4 py-3 bg-zinc-900"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex w-full items-center justify-between h-15 border-b-2 border-zinc-700 px-4 py-2">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <p className="text-lg font-semibold text-white">Análise IA</p>
              </div>
            </div>

            <motion.div className="flex flex-col flex-1 space-y-2">
              {/* - Mensagem de 'Analisando' - */}

              {isAnalyzing && (
                <p className="text-zinc-400 text-lg p-4">
                  Analisando seu código...
                </p>
              )}

              {/* - Seção de erros encontrados - */}

              {!isAnalyzing && error.length > 0 && (
                <motion.div
                  className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 mt-6"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                      <p className="fontt-bold text-xl text-red-500">
                        Erros Encontrados
                      </p>
                    </div>

                    <div className="flex flex-col flex-1">
                      <ul className="space-y-4 p-2">
                        {error.map((error, index) => (
                          <motion.li
                            className="text-sm text-white"
                            key={index}
                          >
                            <span className="text-red-500 mr-2">•</span>
                            {error.charAt(0).toUpperCase() + error.slice(1)}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* - Seção de sugestões do Codara - */}

              {!isAnalyzing && suggestion.length > 0 && (
                <motion.div
                  className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4 mt-6"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
                      <p className="fontt-bold text-xl text-blue-500">
                        Sugestões
                      </p>
                    </div>

                    <div className="flex flex-col flex-1">
                      <ul className="space-y-4 p-2">
                        {suggestion.map((suggestion, index) => (
                          <motion.li
                            className="text-sm text-white"
                            key={index}
                          >
                            <span className="text-blue-500 mr-2">•</span>
                            {suggestion.charAt(0).toUpperCase() +
                              suggestion.slice(1)}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* - Seção de melhorias sugeridas - */}

              {!isAnalyzing && improvement.length > 0 && (
                <motion.div
                  className="bg-green-950/20 border border-green-900/50 rounded-lg p-4 mt-6"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <p className="fontt-bold text-xl text-green-500">
                        Melhorias
                      </p>
                    </div>

                    <div className="flex flex-col flex-1">
                      <ul className="space-y-4 p-2">
                        {improvement.map((improvement, index) => (
                          <motion.li
                            className="text-sm text-white"
                            key={index}
                          >
                            <span className="text-green-500 mr-2">•</span>
                            {improvement.charAt(0).toUpperCase() +
                              improvement.slice(1)}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* - Seção de código corrigido - */}

              {!isAnalyzing && correctedCode && (
                <motion.div
                  className="bg-zinc-800 rounded-lg border-zinc-700 mt-6"
                  initial={{ y: 150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="flex flex-col flex-1 px-6 py-2 mt-2">
                    <div className="flex flex-1">
                      <span className="text-white text-lg font-semibold">
                        Código Corrigido
                      </span>

                      <motion.button
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 px-6 py-2 ml-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        disabled={isAnalyzing || !code.trim()}
                      >
                        Copiar
                      </motion.button>
                    </div>

                    <textarea
                      className="w-full h-40 bg-black rounded-lg resize-none my-4 p-4 text-white placeholder:text-zinc-300 text-lg focus:outline-none"
                      value={correctedCode}
                      readOnly
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export { MainPage };
