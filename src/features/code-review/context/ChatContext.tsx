import { getChats } from "@/features/code-review/service/ChatService";
import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Chat } from "../types/chat";

interface ChatContextType {
  /* - Dados dos Chats - */

  title: string;
  setTitle: (title: string) => void;
  selectedChatId: string | null;
  setSelectedChatId: (selectedChatId: string | null) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;

  /* - Funções - */

  clearContextData: () => void;
  fetchChats: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  /* - Dados dos Chats - */

  const [title, setTitle] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatIdState] = useState<string | null>(
    localStorage.getItem("selectedChatId"),
  );

  const setSelectedChatId = (id: string | null) => {
    setSelectedChatIdState(id);
    if (id) {
      localStorage.setItem("selectedChatId", id);
    } else {
      localStorage.removeItem("selectedChatId");
    }
  };

  /* - Funções - */

  const fetchChats = async () => {
    const data = await getChats();
    setChats(data);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const clearContextData = () => {
    setTitle("");
  };

  return (
    <ChatContext.Provider
      value={{
        /* - Dados dos Chats - */

        title,
        setTitle,
        selectedChatId,
        setSelectedChatId,
        chats,
        setChats,

        /* - Funções - */

        clearContextData,
        fetchChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
