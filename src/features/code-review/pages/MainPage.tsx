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
import { createChat, updateChat } from "../services/chatService";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { generateChatTitle } from "../services/codeReviewService";
import { createPatch } from "../services/patchService";
import { useLocation } from "react-router-dom";
import { useOutletContext } from "react-router";

const MainPage = () => {
  /* - Puxando do context - */

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
  const { isMobile, isLandscape } = useOutletContext<{
    isMobile: boolean;
    isLandscape: boolean;
  }>();

  /* - Estados do código - */

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.patch) {
      const patch = location.state.patch;
      setSelectedChatId(patch.chat_id);
    }
  }, [location.state]);

  const handleAnalyze = async (code: string) => {
    if (!code.trim()) return;

    let chatId = selectedChatId;
    const isNewChat = !selectedChatId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não Autenticado!");

    setIsAnalyzing(true);

    try {
      if (!chatId) {
        const newChat = await createChat({ title: "Novo Bate-Papo" });
        chatId = newChat.id;
      }

      await analyzeCode(code, chatId!);

      await createPatch({
        user_id: user.id,
        chat_id: chatId!,
        title: await generateChatTitle(code),
        had_errors: error.length > 0,
      });

      if (isNewChat) {
        const title = await generateChatTitle(code);
        await updateChat(chatId!, { title });
        await fetchChats();
        setSelectedChatId(chatId);
      }
    } catch (error) {
      console.log("Erro:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const getChatData = async () => {
      if (!selectedChatId) return;

      setError([]);
      setSuggestion([]);
      setImprovement([]);
      setCorrectedCode("");
      setCode("");

      const { data, error: adminError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChatId)
        .eq("role", "admin")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (adminError) {
        console.error("Erro ao buscar admin message:", adminError);
        return;
      }

      const { data: userMessage, error: userError } = await supabase
        .from("messages")
        .select("content")
        .eq("chat_id", selectedChatId)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (userError) {
        console.error("Erro ao buscar user message:", userError);
        return;
      }

      setError(data?.errors ?? []);
      setSuggestion(data?.suggestions ?? []);
      setImprovement(data?.improvements ?? []);
      setCorrectedCode(data?.content ?? "");
      setCode(userMessage?.content ?? "");
    };

    getChatData();
  }, [selectedChatId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode);
  };

  const dark = theme === "Dark";
  const isSmallScreen = isMobile || isLandscape;

  return (
    <div
      className={`flex flex-col ${isSmallScreen ? "w-fit" : "w-full"} h-full overflow-hidden ${dark ? "bg-zinc-900" : "bg-stone-100"}`}
    >
      {/* - Título - */}

      <motion.p
        className={`${isSmallScreen ? "text-2xl" : "text-4xl"} mx-auto my-4 shrink-0 ${dark ? "text-white" : "text-stone-800 font-semibold"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        Vamos ao trabalho, {name.split(" ")[0]}?
      </motion.p>

      {/* - Tela dividida - */}

      <div
        className={`flex flex-1 min-h-0 overflow-hidden ${isSmallScreen ? "flex-col overflow-y-auto" : "flex-row"}`}
      >
        {/* - Lado esquerdo: Meu código - */}

        <motion.div
          className={`flex flex-col mx-4 my-2 overflow-hidden ${isSmallScreen ? "h-80 shrink-0" : "flex-1 min-h-0"} ${dark ? "bg-zinc-900" : "bg-stone-100"}`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div
            className={`flex w-full items-center justify-between h-15 border-b-2 px-4 py-2 shrink-0 ${dark ? "border-zinc-700" : "border-stone-300"}`}
          >
            <div className="flex items-center">
              <Code2 className="h-5 w-5 text-blue-600 mr-2" />
              <p
                className={`text-lg font-semibold ${dark ? "text-white" : "text-stone-800"}`}
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
            className={`flex-1 min-h-0 rounded-lg resize-none focus:outline-none my-6 mx-4 p-4 ${dark ? "bg-black text-white placeholder:text-zinc-300" : "bg-white text-stone-800 placeholder:text-stone-400 border border-stone-200 shadow-sm"}`}
            placeholder="Por onde você quer começar?"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </motion.div>

        {/* - Lado direito: Resposta do Codara - */}

        <motion.div
          className={`flex flex-col mx-2 mt-3 mb-8 overflow-hidden ${isSmallScreen ? "h-auto shrink-0" : "flex-1 min-h-0"} ${dark ? "bg-zinc-900" : "bg-stone-100"}`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div
            className={`flex w-full items-center justify-between h-15 border-b-2 px-4 py-2 shrink-0 ${dark ? "border-zinc-700" : "border-stone-300"}`}
          >
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              <p
                className={`text-lg font-semibold ${dark ? "text-white" : "text-stone-800"}`}
              >
                Análise IA
              </p>
            </div>
          </div>

          {/* - Container scrollável - */}

          <div className="flex-1 min-h-0 overflow-y-auto py-2 px-2">
            <div className="flex flex-col space-y-2">
              {/* - Feedback de que está analisando - */}

              {isAnalyzing && (
                <p
                  className={`text-lg p-4 ${dark ? "text-zinc-400" : "text-stone-500"}`}
                >
                  Analisando seu código...
                </p>
              )}

              {/* - Erros encontrados - */}

              {!isAnalyzing && error.length > 0 && (
                <motion.div
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${dark ? "bg-red-950/40 border-red-800/70" : "bg-red-50 border-red-200"}`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <p className="font-bold text-lg text-red-500">
                      Erros Encontrados
                    </p>
                  </div>
                  <ul className="space-y-4 p-2">
                    {error.map((err, index) => (
                      <motion.li
                        className={`text-sm font-semibold ${dark ? "text-white" : "text-black"}`}
                        key={index}
                      >
                        <span className="text-red-500 mr-2">•</span>
                        {err.charAt(0).toUpperCase() + err.slice(1)}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* - Sugestões - */}

              {!isAnalyzing && suggestion.length > 0 && (
                <motion.div
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${dark ? "bg-blue-950/40 border-blue-800/70" : "bg-blue-50 border-blue-200"}`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-6 w-6 text-blue-500" />
                    <p className="font-bold text-lg text-blue-500">Sugestões</p>
                  </div>
                  <ul className="space-y-4 p-2">
                    {suggestion.map((sug, index) => (
                      <motion.li
                        className={`text-sm font-semibold ${dark ? "text-white" : "text-black"}`}
                        key={index}
                      >
                        <span className="text-blue-500 mr-2">•</span>
                        {sug.charAt(0).toUpperCase() + sug.slice(1)}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* - Melhorias - */}

              {!isAnalyzing && improvement.length > 0 && (
                <motion.div
                  className={`rounded-lg p-4 mt-6 max-w-[94%] border ${dark ? "bg-green-950/40 border-green-800/70" : "bg-green-50 border-green-200"}`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <p className="font-bold text-lg text-green-500">
                      Melhorias
                    </p>
                  </div>
                  <ul className="space-y-4 p-2">
                    {improvement.map((imp, index) => (
                      <motion.li
                        className={`text-sm font-semibold ${dark ? "text-white" : "text-black"}`}
                        key={index}
                      >
                        <span className="text-green-500 mr-2">•</span>
                        {imp.charAt(0).toUpperCase() + imp.slice(1)}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* - Código corrigido - */}

              {!isAnalyzing && correctedCode && (
                <motion.div
                  className={`flex flex-col rounded-lg mt-6 max-w-[94%] min-h-70 max-h-96 ${dark ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-stone-200 shadow-sm"}`}
                  initial={{ y: 150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="flex items-center px-6 py-4 shrink-0">
                    <span
                      className={`text-lg font-semibold ${dark ? "text-white" : "text-stone-800"}`}
                    >
                      Código Corrigido
                    </span>
                    <motion.button
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 px-6 py-2 ml-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      disabled={isAnalyzing || !correctedCode}
                    >
                      Copiar
                    </motion.button>
                  </div>

                  <textarea
                    className={`flex-1 min-h-0 rounded-b-lg resize-none mx-4 mb-4 p-4 text-lg focus:outline-none ${dark ? "bg-black text-white" : "bg-stone-50 text-stone-800 border border-stone-200"}`}
                    value={correctedCode}
                    readOnly
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { MainPage };
