import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const useChatContext = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("ChatContext must be used inside an ChatProvider");
  }
  return context;
};

export { useChatContext };
