import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sideBarIcons } from "../utils/sideBarIcons";
import { createChat } from "@/features/code-review/service/ChatService";
import { uploadUserPhoto } from "@/features/authentication/service/authenticationService";
import { supabase } from "@/supabase/supabase";
import { FaTrashAlt, FaPenAlt } from "react-icons/fa";
import { ChatTitleModal } from "./ChatTitleModal";
import { useThemeContext } from "../hooks/useThemeContext";
import {
  useChatContext,
  usePatchContext,
  type Chat,
} from "@/features/code-review";
import { ChatDeleteModal } from "./ChatDeleteModal";
import { getPatches } from "@/features/code-review/service/PatchService";

const SideBar = () => {
  /* - Puxando do context - */

  const { theme, toggleTheme } = useThemeContext();
  const { name, photo, email } = useAuthenticationContext();
  const { patches, setPatches } = usePatchContext();
  const { selectedChatId, setSelectedChatId, chats, setChats, fetchChats } =
    useChatContext();

  const photoUrl = photo ? URL.createObjectURL(photo) : null;

  /* - Estados gerais - */

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  /* - Estados do modal - */

  const [isChatTitleModalOpen, setIsChatTitleModalOpen] =
    useState<boolean>(false);

  const [isChatDeleteModalOpen, setIsChatDeleteModalOpen] =
    useState<boolean>(false);

  /* - Estados do dropdown - */

  const [isUserPreferencesOpen, setIsUserPreferencesOpen] =
    useState<boolean>(false);

  /* - Estados do histórico de correções - */

  const [isPatchHistoryOpen, setIsPatchHistoryOpen] = useState<boolean>(false);

  /* - Buscando ID no Supabase - */

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  return (
    <>
      <motion.div
        className={`flex flex-col whitespace-nowrap space-y-4 border-r overflow-hidden font-semibold ${
          theme === "Dark"
            ? "bg-zinc-800 border-zinc-700 text-white"
            : "bg-white border-stone-200 text-black"
        }`}
        initial={{ width: 0, opacity: 0 }}
        exit={{ width: 0, opacity: 0 }}
        animate={{ width: 256, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col flex-1 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <span
            className={`px-4 py-3 font-semibold text-xl mb-4 ${
              theme === "Dark" ? "text-white" : "text-black"
            }`}
          >
            Codara AI
          </span>

          <motion.ul
            className="transition-all duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            {sideBarIcons.map((option, index) => (
              <div
                className="relative flex flex-col gap-2 m-4 group"
                key={index}
                onClick={async () => {
                  if (option.label === "Novo Bate-Papo") {
                    const newChat = await createChat({
                      title: "Novo Bate-Papo",
                    });
                    setChats([...chats, newChat]);
                  }

                  if (option.label === "Preferências do Usuário") {
                    setIsUserPreferencesOpen(!isUserPreferencesOpen);
                  }

                  if (option.label === "Histórico de Correções") {
                    setIsPatchHistoryOpen(!isPatchHistoryOpen);
                    if (selectedChatId) {
                      const data = await getPatches(selectedChatId);
                      console.log(data);
                      setPatches(data);
                    }
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <option.icon
                    className={`h-8 w-8 p-2 rounded-full text-center text-blue-600 group-hover:text-blue-400 ${
                      theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"
                    }`}
                  />

                  <span
                    className={`flex items-center justify-center group-hover:opacity-70 ${
                      theme === "Dark" ? "text-white" : "text-black"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>

                {/* - Histórico de correções de cada chat - */}

                {option.label === "Histórico de Correções" && (
                  <AnimatePresence>
                    {isPatchHistoryOpen && (
                      <motion.ul
                        className={`flex flex-col items-center mx-8 rounded-lg px-4 py-2 z-50 w-44 cursor-pointer border ${
                          theme === "Dark"
                            ? "bg-zinc-900 border-zinc-700"
                            : "bg-white border-stone-200 shadow-sm"
                        }`}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {patches.map((patch) => (
                          <li
                            className={`flex items-center justify-between gap-2 py-2 ${
                              theme === "Dark" ? "text-white" : "text-black"
                            }`}
                            key={patch.id}
                          >
                            <span className="text-white text-sm font-semibold whitespace-nowrap">
                              {patch.title}
                            </span>

                            {patch.had_errors ? (
                              <span className="text-red-500 text-xs">✗</span>
                            ) : (
                              <span className="text-green-500 text-xs">✓</span>
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}

                {/* - Preferências do usuário - */}

                {option.label === "Preferências do Usuário" && (
                  <AnimatePresence>
                    {isUserPreferencesOpen && (
                      <motion.ul
                        className={`mx-8 rounded-lg px-4 py-2 z-50 w-44 cursor-pointer border ${
                          theme === "Dark"
                            ? "bg-zinc-900 border-zinc-700"
                            : "bg-white border-stone-200 shadow-sm"
                        }`}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <li className="flex flex-col items-center">
                          <button
                            className={`font-semibold cursor-pointer ${
                              theme === "Dark" ? "text-white" : "text-black"
                            }`}
                            onClick={() =>
                              toggleTheme(theme === "Dark" ? "Light" : "Dark")
                            }
                          >
                            {theme === "Dark"
                              ? "Tema Claro ☀️"
                              : "Tema Escuro 🌕"}
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </motion.ul>

          <ul className="mt-auto mb-2 mr-3">
            {chats.map((chat) => (
              <div
                className="flex"
                key={chat.id}
              >
                <li
                  className={`flex ml-4 mr-auto my-3 font-semibold ${
                    theme === "Dark"
                      ? "text-white hover:text-zinc-300"
                      : "text-black hover:text-stone-500"
                  }`}
                  role="button"
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  {chat.title}
                </li>

                <div className="flex">
                  <button
                    className="group"
                    onClick={async () => {
                      setSelectedChatId(chat.id);
                      setIsChatDeleteModalOpen(!isChatDeleteModalOpen);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center p-2 rounded-lg border border-transparent cursor-pointer ${
                        theme === "Dark"
                          ? "group-hover:bg-zinc-900 group-hover:border-zinc-700"
                          : "group-hover:bg-stone-400 group-hover:border-stone-700"
                      }`}
                    >
                      <FaTrashAlt
                        className={`group-hover:text-red-600 ${
                          theme === "Dark" ? "text-zinc-400" : "text-stone-800"
                        }`}
                      />
                    </div>
                  </button>

                  <button
                    className="group"
                    onClick={() => {
                      setSelectedChat(chat);
                      setSelectedChatId(chat.id);
                      setIsChatTitleModalOpen(true);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center p-2 rounded-lg border border-transparent cursor-pointer ${
                        theme === "Dark"
                          ? "group-hover:bg-zinc-900 group-hover:border-zinc-700"
                          : "group-hover:bg-stone-400 group-hover:border-stone-700"
                      }`}
                    >
                      <FaPenAlt
                        className={`group-hover:text-blue-600 ${
                          theme === "Dark" ? "text-zinc-400" : "text-stone-800"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </ul>
        </motion.div>

        <div
          className={`flex flex-col justify-center px-4 flex-1 border-t max-h-20 font-semibold ${
            theme === "Dark" ? "border-zinc-700" : "border-stone-200"
          }`}
        >
          <div className="flex gap-2 text-lg items-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div
                className={`flex justify-center items-center w-8 h-8 rounded-full bg-blue-600 border ${
                  theme === "Dark" ? "border-zinc-700" : "border-blue-400"
                }`}
              >
                <div className="text-white">{name.charAt(0)}</div>
              </div>
            )}

            <span className={theme === "Dark" ? "text-white" : "text-black"}>
              {name}
            </span>
          </div>

          <div
            className={`text-xs mx-10 ${
              theme === "Dark" ? "text-zinc-500" : "text-stone-400"
            }`}
          >
            {email ?? ""}
          </div>

          <input
            className="hidden"
            type="file"
            accept="image/*"
            id="photo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && userId) {
                uploadUserPhoto(file, userId);
              }
            }}
          />
        </div>
      </motion.div>

      {isChatTitleModalOpen && (
        <ChatTitleModal
          key="modalTitle"
          setIsChatTitleModalOpen={setIsChatTitleModalOpen}
          chatId={selectedChatId}
          onConfirm={fetchChats}
          currentTitle={selectedChat?.title ?? ""}
        />
      )}

      {isChatDeleteModalOpen && (
        <ChatDeleteModal
          key="modalDelete"
          setIsChatDeleteModalOpen={setIsChatDeleteModalOpen}
          chatId={selectedChatId}
          onConfirm={fetchChats}
        />
      )}
    </>
  );
};

export { SideBar };
