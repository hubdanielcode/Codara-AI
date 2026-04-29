import { createContext, useState, type ReactNode } from "react";
import type { Patch } from "../types/patch";

export interface PatchContextType {
  updateTitle: string;
  setUpdateTitle: (updateTitle: string) => void;
  date: string;
  setDate: (date: string) => void;
  patches: Patch[];
  setPatches: (patches: Patch[]) => void;
}

const PatchContext = createContext<PatchContextType | null>(null);

const PatchProvider = ({ children }: { children: ReactNode }) => {
  const [updateTitle, setUpdateTitle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [patches, setPatches] = useState<Patch[]>([]);

  return (
    <PatchContext.Provider
      value={{
        updateTitle,
        setUpdateTitle,
        date,
        setDate,
        patches,
        setPatches,
      }}
    >
      {children}
    </PatchContext.Provider>
  );
};

export { PatchContext, PatchProvider };
