import { createContext, useState, type ReactNode } from "react";

export interface MessageContextType {
  /* - Dados das Mensagens - */

  content: string;
  setContent: (content: string) => void;

  /* - Funções - */

  clearContextData: () => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

const MessageProvider = ({ children }: { children: ReactNode }) => {
  /* - Dados das mensagens - */

  const [content, setContent] = useState<string>("");

  /* - Funções - */

  const clearContextData = () => {
    setContent("");
  };

  return (
    <MessageContext.Provider
      value={{
        /* - Dados das mensagens - */

        content,
        setContent,

        /* - Funções - */

        clearContextData,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
