import { useContext } from "react";
import { OutletContext } from "../context/OutletContext";

const useOutletContext = () => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error("useOutletContext must be used within a OutletProvider");
  }
  return context;
};

export { useOutletContext };
