import { useChatContext } from "@/features/code-review";
import { deleteChat } from "@/features/code-review/service/ChatService";
import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ChatDeleteModalProps {
  setIsChatDeleteModalOpen: (isChatDeleteModalOpen: boolean) => void;
  chatId: string | null;
  onConfirm: () => void;
}

const ChatDeleteModal: React.FC<ChatDeleteModalProps> = ({
  setIsChatDeleteModalOpen,
  chatId,
  onConfirm,
}) => {
  const { chats, setChats } = useChatContext();
  const { theme } = useThemeContext();

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-black/60 min-h-screen w-full z-50">
      <div
        className={`relative flex rounded-lg w-[22%] h-fit border ${
          theme === "Dark"
            ? "bg-zinc-800 border-zinc-700"
            : "bg-white border-stone-200 shadow-md"
        }`}
      >
        <div className="flex flex-col mx-auto">
          <div className="flex flex-col flex-1 justify-between my-3">
            <p
              className={`font-semibold text-3xl mx-auto mb-1 ${
                theme === "Dark" ? "text-white" : "text-black"
              }`}
            >
              Apagar chat
            </p>

            <p
              className={`font-semibold text-md mt-2 my-3 ${
                theme === "Dark" ? "text-zinc-400" : "text-stone-500"
              }`}
            >
              Tem certeza que deseja excluir esse chat?
            </p>

            <div className="flex flex-1 justify-between my-6">
              <motion.button
                className="bg-red-600 w-fit h-fit px-4 py-2 text-white font-semibold text-lg border border-red-700 rounded-lg cursor-pointer"
                initial={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  await deleteChat(chatId!);
                  localStorage.removeItem("selectedChatId");
                  setChats(chats.filter((chat) => chat.id !== chatId));
                  onConfirm();
                  setIsChatDeleteModalOpen(false);
                }}
              >
                Apagar
              </motion.button>

              <motion.button
                className="w-fit h-fit px-4 py-2 bg-zinc-900 text-white border-zinc-700 font-semibold text-lg rounded-lg cursor-pointer border"
                initial={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatDeleteModalOpen(false)}
              >
                Cancelar
              </motion.button>
            </div>
          </div>
        </div>

        <button
          className="absolute top-5 right-5 cursor-pointer"
          onClick={() => setIsChatDeleteModalOpen(false)}
        >
          <X className="bg-red-600 rounded-lg text-white" />
        </button>
      </div>
    </div>
  );
};

export { ChatDeleteModal };
