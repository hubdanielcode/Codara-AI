import { useContext } from "react";
import { MessageContext } from "../context/MessageContext";

const useMessageContext = () => {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error("MessageContext must be used inside an MessageProvider");
  }
  return context;
};

export { useMessageContext };
