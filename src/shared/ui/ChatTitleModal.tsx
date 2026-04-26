import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { updateChat } from "@/features/code-review/service/ChatService";
import { useState, useRef, useEffect } from "react";

interface ChatTitleModalProps {
  setIsChatTitleModalOpen: (isChatTitleModalOpen: boolean) => void;
  chatId: string | null;
  onConfirm: () => void;
  currentTitle: string;
}

const ChatTitleModal: React.FC<ChatTitleModalProps> = ({
  setIsChatTitleModalOpen,
  chatId,
  onConfirm,
  currentTitle,
}) => {
  /* - Puxando do context - */

  const { theme } = useThemeContext();

  /* - Estados gerais - */

  const [newTitle, setNewTitle] = useState<string>(currentTitle);
  const [editingTitleError, setEditingTitleError] = useState<string>("");

  /* - Criando a referência para fechar o erro ao clicar fora - */

  const EditingTitleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!EditingTitleRef.current) return;

      if (!EditingTitleRef.current.contains(e.target as Node)) {
        setEditingTitleError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-black/90 min-h-screen w-full z-50">
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg w-[25%] h-75 border ${
          theme === "Dark"
            ? "bg-zinc-800 border-zinc-700"
            : "bg-white border-stone-200 shadow-md"
        }`}
      >
        <div className="flex flex-col mx-auto my-2">
          <p
            className={`font-semibold text-3xl my-3 pb-4 ${
              theme === "Dark" ? "text-white" : "text-stone-800"
            }`}
          >
            Mudar título do chat
          </p>

          <input
            className={`w-full h-10 rounded-lg p-3 relative border focus:outline-none ${
              theme === "Dark"
                ? "text-white bg-zinc-900 border-zinc-700 placeholder:text-zinc-400"
                : "text-stone-800 bg-stone-50 border-stone-300 placeholder:text-stone-400"
            }`}
            placeholder="Digite o novo título..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="flex flex-1 justify-between my-6">
            <motion.button
              className="bg-blue-600 w-fit h-fit px-4 py-2 text-white font-semibold text-lg border border-blue-700 rounded-lg cursor-pointer"
              initial={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              ref={EditingTitleRef}
              onClick={async () => {
                if (!newTitle.trim()) {
                  setEditingTitleError("Insira um título válido!");
                  return;
                }

                await updateChat(chatId!, { title: newTitle });
                onConfirm();
                setIsChatTitleModalOpen(false);
              }}
            >
              Confirmar
            </motion.button>

            <motion.button
              className="bg-red-600 w-fit h-fit px-4 py-2 text-white font-semibold text-lg border border-red-700 rounded-lg cursor-pointer"
              initial={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNewTitle(currentTitle);
                setIsChatTitleModalOpen(false);
              }}
            >
              Cancelar
            </motion.button>
          </div>
        </div>

        <button
          className="absolute top-9 right-9 cursor-pointer"
          onClick={() => setIsChatTitleModalOpen(false)}
        >
          <X className="bg-red-600 rounded-lg text-white h-7 w-7" />
        </button>

        <motion.div
          className="min-h-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editingTitleError && (
            <p className="w-70 flex items-center justify-center h-12 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 text-center">
              {editingTitleError}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export { ChatTitleModal };
