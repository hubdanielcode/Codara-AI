import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Code2,
  Lightbulb,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCodeReviewContext } from "../hooks/useCodeReviewContext";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useChatContext } from "../hooks/useChatContext";
import { supabase } from "@/supabase/supabase";
import {
  createChat,
  updateChat,
} from "@/features/code-review/service/ChatService";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

const MainPage = () => {
  /* - Puxando do Context - */

  const {
    error,
    setError,
    suggestion,
    setSuggestion,
    improvement,
    setImprovement,
    correctedCode,
    setCorrectedCode,
    analyzeCode,
  } = useCodeReviewContext();

  const { name } = useAuthenticationContext();
  const { selectedChatId, setSelectedChatId, fetchChats } = useChatContext();
  const { theme } = useThemeContext();

  /* - Estados do Código - */

  const [isAnalyzing, setIsAnalyzing] = useState<boolean | null>(null);
  const [code, setCode] = useState<string>("");
  const [isNewChat, setIsNewChat] = useState<boolean>(false);

  /* - Funções - */

  const handleAnalyze = async (code: string) => {
    let chatId = selectedChatId;

    if (!code.trim()) return;

    if (!chatId) {
      const newChat = await createChat({ title: "Novo Bate-Papo" });
      setIsNewChat(true);
      setSelectedChatId(newChat.id);
      chatId = newChat.id;
    }

    setIsAnalyzing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await analyzeCode(code, chatId!);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content: `Gere um título curto (máximo 4 palavras) para uma conversa sobre esse código. Retorne APENAS o título, sem aspas, sem pontuação.\n\n${code}`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const title = data.choices[0].message.content.trim();
      await updateChat(chatId!, { title });
      fetchChats();
    } catch (error) {
      console.log("Erro ao ler seu código:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* - Buscando o ChatId no Supabase - */

  useEffect(() => {
    const getChatData = async () => {
      if (!selectedChatId) return;

      if (isNewChat) {
        setIsNewChat(false);
        return;
      }

      setError([]);
      setSuggestion([]);
      setImprovement([]);
      setCorrectedCode("");
      setCode("");

      const { error, data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChatId)
        .eq("role", "admin")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) return;

      const { data: userMessage } = await supabase
        .from("messages")
        .select("content")
        .eq("chat_id", selectedChatId)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setError(data.errors ?? []);
      setSuggestion(data.suggestions ?? []);
      setImprovement(data.improvements ?? []);
      setCorrectedCode(data.content ?? "");
      setCode(userMessage?.content ?? "");
    };
    getChatData();
  }, [selectedChatId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode);
  };

  return (
    <>
      <div
        className={`flex flex-col min-h-screen min-w-full ${theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"}`}
      >
        <motion.p
          className={`text-4xl mx-auto my-4 ${theme === "Dark" ? "text-white" : "text-stone-800 font-semibold"}`}
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
            className={`flex flex-col flex-1 px-4 py-3 ${theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div
              className={`flex w-full items-center justify-between h-15 border-b-2 px-4 py-2 ${theme === "Dark" ? "border-zinc-700" : "border-stone-300"}`}
            >
              <div className="flex items-center">
                <Code2 className="h-5 w-5 text-blue-600 mr-2" />
                <p
                  className={`text-lg font-semibold ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
                >
                  Seu Código
                </p>
              </div>

              <motion.button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 px-6 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnalyze(code)}
                disabled={isAnalyzing || !code.trim()}
              >
                <Play className="h-5 w-5 text-white" />
                {isAnalyzing ? "Analisando..." : "Analisar"}
              </motion.button>
            </div>

            <textarea
              className={`flex-1 rounded-lg resize-none focus:outline-none my-6 mx-4 p-4 ${theme === "Dark" ? "bg-black text-white placeholder:text-zinc-300" : "bg-white text-stone-800 placeholder:text-stone-400 border border-stone-200 shadow-sm"}`}
              placeholder="Por onde você quer começar?"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </motion.div>

          {/* - Lado direito: Resposta do Codara - */}

          <motion.div
            className={`flex flex-col flex-1 px-4 py-3 ${theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div
              className={`flex w-full items-center justify-between h-15 border-b-2 px-4 py-2 ${theme === "Dark" ? "border-zinc-700" : "border-stone-300"}`}
            >
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <p
                  className={`text-lg font-semibold ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
                >
                  Análise IA
                </p>
              </div>
            </div>

            <motion.div className="flex flex-col flex-1 space-y-2">
              {/* - Mensagem de 'Analisando' - */}

              {isAnalyzing && (
                <p
                  className={`text-lg p-4 ${theme === "Dark" ? "text-zinc-400" : "text-stone-500"}`}
                >
                  Analisando seu código...
                </p>
              )}

              {/* - Seção de erros encontrados - */}

              {!isAnalyzing && error.length > 0 && (
                <motion.div
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${
                    theme === "Dark"
                      ? "bg-red-950/40 border-red-800/70"
                      : "bg-red-50 border-red-200"
                  }`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                      <p className="font-bold text-xl text-red-500">
                        Erros Encontrados
                      </p>
                    </div>

                    <div className="flex flex-col flex-1 font-semibold">
                      <ul className="space-y-4 p-2">
                        {error.map((error, index) => (
                          <motion.li
                            className={`text-sm ${theme === "Dark" ? "text-white" : "text-black"}`}
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
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${
                    theme === "Dark"
                      ? "bg-blue-950/40 border-blue-800/70"
                      : "bg-blue-50 border-blue-200"
                  }`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
                      <p className="font-bold text-xl text-blue-500">
                        Sugestões
                      </p>
                    </div>

                    <div className="flex flex-col flex-1 font-semibold">
                      <ul className="space-y-4 p-2">
                        {suggestion.map((suggestion, index) => (
                          <motion.li
                            className={`text-sm ${theme === "Dark" ? "text-white" : "text-black"}`}
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
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${
                    theme === "Dark"
                      ? "bg-green-950/40 border-green-800/70"
                      : "bg-green-50 border-green-200"
                  }`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-1 items-center gap-2 mb-1">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <p className="font-bold text-xl text-green-500">
                        Melhorias
                      </p>
                    </div>

                    <div className="flex flex-col flex-1 font-semibold">
                      <ul className="space-y-4 p-2">
                        {improvement.map((improvement, index) => (
                          <motion.li
                            className={`text-sm ${theme === "Dark" ? "text-white" : "text-black"}`}
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
                  className={`rounded-lg mt-6 max-w-[94%] ${theme === "Dark" ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-stone-200 shadow-sm"}`}
                  initial={{ y: 150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="flex flex-col flex-1 px-6 py-2 mt-2">
                    <div className="flex flex-1">
                      <span
                        className={`text-lg font-semibold ${theme === "Dark" ? "text-white" : "text-stone-800"}`}
                      >
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
                      className={`w-full h-35 rounded-lg resize-none my-4 p-4 text-lg focus:outline-none ${theme === "Dark" ? "bg-black text-white placeholder:text-zinc-300" : "bg-stone-50 text-stone-800 placeholder:text-stone-400 border border-stone-200"}`}
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
