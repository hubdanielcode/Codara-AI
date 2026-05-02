import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sideBarIcons } from "../utils/sideBarIcons";
createChat;
import { uploadUserPhoto } from "@/features/authentication/services/authenticationService";
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
import {
  deletePatch,
  getPatches,
} from "@/features/code-review/services/patchService";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PhotoCropModal } from "./PhotoCropModal";
import { createChat } from "@/features/code-review/services/chatService";

export interface SideBarProps {
  isMobile: boolean;
  onClose: () => void;
}

const SideBar = ({ isMobile, onClose }: SideBarProps) => {
  /* - Puxando do context - */

  const { theme, toggleTheme } = useThemeContext();
  const { name, photo, email, setPhoto } = useAuthenticationContext();
  const { patches, setPatches } = usePatchContext();
  const { selectedChatId, setSelectedChatId, chats, setChats, fetchChats } =
    useChatContext();

  /* - Estados gerais - */

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");

  /* - Estados dos modais - */

  const [isChatTitleModalOpen, setIsChatTitleModalOpen] =
    useState<boolean>(false);

  const [isChatDeleteModalOpen, setIsChatDeleteModalOpen] =
    useState<boolean>(false);

  const [isPhotoCropModalOpen, setIsPhotoCropModalOpen] =
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

  /* - Funções - */

  const navigate = useNavigate();

  const patchDay = new Date().toLocaleDateString("pt-BR");

  const handleClearPatchHistory = async () => {
    await Promise.all(patches.map((patch) => deletePatch(patch.id)));
    setPatches([]);
  };

  const handlePhotoClick = () => {
    document.getElementById("photo")?.click();
  };

  const handleaddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
    setIsPhotoCropModalOpen(true);
  };

  /* - Criando as referências para fechar os menus ao clicar fora - */

  // 1. Histórico de correções

  const PatchDropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!PatchDropdownRef.current) return;
      if (!PatchDropdownRef.current.contains(e.target as Node)) {
        setIsPatchHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Preferências do usuário

  const UserPreferencesDropwdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!UserPreferencesDropwdownRef.current) return;
      if (!UserPreferencesDropwdownRef.current.contains(e.target as Node)) {
        setIsUserPreferencesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* - SideBar propriamente dita - */}

      <motion.div
        className={`flex flex-col h-full whitespace-nowrap space-y-4 border-r overflow-hidden font-semibolds ${
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
                    setIsPatchHistoryOpen(true);
                    if (selectedChatId) {
                      const data = await getPatches(selectedChatId);
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
                        className={`flex flex-col flex-1 w-full rounded-xl border ${theme === "Dark" ? "border-zinc-700" : "border-stone-200"}`}
                        ref={PatchDropdownRef}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {patches.map((patch) => (
                          <motion.li
                            className={`flex items-center justify-between gap-2 px-4 py-2 w-full overflow-hidden first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4 ${
                              theme === "Dark"
                                ? "text-white bg-zinc-950 border-zinc-700"
                                : "text-black bg-stone-100 border-stone-200"
                            }`}
                            key={patch.title}
                          >
                            <div
                              className={`flex flex-col flex-1 min-w-0 text-sm text-left font-semibold rounded-lg overflow-hidden px-4 py-2 border ${theme === "Dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-stone-200"}`}
                              title={patch.title}
                            >
                              <div className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock
                                    className={`h-4 w-4 mr-2 ${theme === "Dark" ? "text-zinc-400" : "text-stone-500"}`}
                                  />
                                  <span
                                    className={`mr-auto ${theme === "Dark" ? "text-zinc-400" : "text-stone-500"}`}
                                  >
                                    {patchDay}
                                  </span>
                                </div>

                                {patch.had_errors ? (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </div>

                              <span
                                className="truncate cursor-pointer"
                                onClick={() =>
                                  navigate("/pagina-principal", {
                                    state: { patch },
                                  })
                                }
                              >
                                {patch.title}
                              </span>
                            </div>
                          </motion.li>
                        ))}

                        <div
                          className={`flex flex-col flex-1 w-full justify-center items-center cursor-pointer rounded-b-xl ${theme === "Dark" ? "text-white bg-zinc-950 border-zinc-700" : "text-black bg-stone-100 border-stone-200"}`}
                        >
                          <button
                            className={`font-semibold px-2 py-1 bg-red-600 border rounded-lg text-white w-[85%] h-[10%] mt-2 mb-4 disabled:hidden cursor-pointer ${theme === "Dark" ? "border-zinc-700" : "border-stone-200"}`}
                            onClick={handleClearPatchHistory}
                            disabled={patches.length === 0}
                          >
                            Limpar Histórico
                          </button>
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}

                {/* - Preferências do usuário - */}

                {option.label === "Preferências do Usuário" && (
                  <AnimatePresence>
                    {isUserPreferencesOpen && (
                      <motion.ul
                        className={`flex flex-col flex-1 w-full rounded-xl border ${theme === "Dark" ? "border-zinc-700" : "border-stone-200"}`}
                        ref={UserPreferencesDropwdownRef}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.li
                          className={`flex items-center justify-between gap-2 px-4 py-2 w-full overflow-hidden first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4 ${
                            theme === "Dark"
                              ? "text-white bg-zinc-950 border-zinc-700"
                              : "text-black bg-stone-100 border-stone-200"
                          }`}
                        >
                          <div
                            className={`flex flex-col flex-1 min-w-0 text-sm text-left font-semibold rounded-lg overflow-hidden px-4 py-2 border ${theme === "Dark" ? "bg-zinc-900 border-zinc-700 text-white" : "bg-white border-stone-200 text-black"}`}
                            role="button"
                            onClick={() =>
                              toggleTheme(theme === "Dark" ? "Light" : "Dark")
                            }
                          >
                            {theme === "Dark"
                              ? "Tema Claro ☀️"
                              : "Tema Escuro 🌕"}
                          </div>
                        </motion.li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </motion.ul>

          {/* - Lista de chats - */}

          <ul className="mt-auto mb-2 mr-3">
            {chats.map((chat) => (
              <div
                className="flex items-center gap-2 px-4 my-1 min-w-0"
                key={chat.id}
              >
                {/* - Título do chat - */}

                <p
                  className={`truncate flex-1 min-w-0 font-semibold cursor-pointer my-2 ${
                    theme === "Dark"
                      ? "text-white hover:text-zinc-300"
                      : "text-black hover:text-stone-500"
                  }`}
                  onClick={() => setSelectedChatId(chat.id)}
                  title={chat.title}
                >
                  {chat.title}
                </p>

                {/* - Botões de ação - */}

                <div className="flex shrink-0">
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
                        data-testid="modal-delete"
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
                        data-testid="modal-update"
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </ul>
        </motion.div>

        {/* - Informações do usuário - */}

        <div
          className={`flex flex-col justify-center px-4 flex-1 border-t max-h-20 font-semibold ${
            theme === "Dark" ? "border-zinc-700" : "border-stone-200"
          }`}
        >
          <div className="flex gap-2 text-lg items-center">
            {/* - Foto do usuário - */}

            {photo ? (
              <img
                src={photo}
                alt={name}
                className="w-10 h-10 rounded-full cursor-pointer object-cover"
                onClick={handlePhotoClick}
              />
            ) : (
              <div
                className={`flex justify-center items-center w-8 h-8 rounded-full bg-blue-600 border cursor-pointer ${
                  theme === "Dark" ? "border-zinc-700" : "border-blue-400"
                }`}
                onClick={handlePhotoClick}
              >
                <span className="text-white text-sm">{name.charAt(0)}</span>
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

          {/* - Input de foto escondido - */}

          <input
            className="hidden"
            type="file"
            accept="image/*"
            id="photo"
            onChange={handleaddPhoto}
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

      {isPhotoCropModalOpen && (
        <PhotoCropModal
          imageSrc={cropImageSrc}
          onConfirm={async (croppedImage) => {
            /* - Convertendo base64 para File - */

            const response = await fetch(croppedImage);
            const blob = await response.blob();
            const file = new File([blob], "photo.png", { type: "image/png" });

            /* - Fazendo upload e atualizando a foto no context - */

            const url = await uploadUserPhoto(file, userId!);
            setPhoto(url);
            setIsPhotoCropModalOpen(false);
          }}
          onClose={() => setIsPhotoCropModalOpen(false)}
        />
      )}
    </>
  );
};

export { SideBar };
