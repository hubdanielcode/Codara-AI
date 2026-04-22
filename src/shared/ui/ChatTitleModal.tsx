import { useChatContext } from "@/features/code-review/hooks/useChatContext";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { updateChat } from "@/features/code-review/service/ChatService";

interface ChatTitleModalProps {
  setIsChatTitleModalOpen: (isChatTitleModalOpen: boolean) => void;
  chatId: string | null;
  onConfirm: () => void;
}

const ChatTitleModal: React.FC<ChatTitleModalProps> = ({
  setIsChatTitleModalOpen,
  chatId,
  onConfirm,
}) => {
  /* - Puxando do Context - */

  const { title, setTitle } = useChatContext();
  const { theme } = useThemeContext();

  /* - Estado do Modal de Edição - */

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-black/60 min-h-screen w-full z-50">
      <div
        className={`flex rounded-lg w-[22%] h-fit border ${
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-1 justify-between my-6">
            <motion.button
              className="bg-blue-600 w-fit h-fit px-4 py-2 text-white font-semibold text-lg border border-blue-700 rounded-lg cursor-pointer"
              initial={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await updateChat(chatId!, { title });
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
                setTitle("");
                setIsChatTitleModalOpen(false);
              }}
            >
              Cancelar
            </motion.button>
          </div>
        </div>

        <button
          className="absolute top-97 right-190 cursor-pointer"
          onClick={() => setIsChatTitleModalOpen(false)}
        >
          <X className="bg-red-600 rounded-lg text-white" />
        </button>
      </div>
    </div>
  );
};

export { ChatTitleModal };
