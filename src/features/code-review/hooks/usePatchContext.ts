import { useContext } from "react";
import { PatchContext } from "../context/PatchContext";

const usePatchContext = () => {
  const context = useContext(PatchContext);

  if (!context) {
    throw new Error("PatchContext must be used within a PatchProvider");
  }
  return context;
};

export { usePatchContext };
