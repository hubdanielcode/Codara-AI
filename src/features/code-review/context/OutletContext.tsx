import { createContext, useState, type ReactNode } from "react";

export interface OutletContextType {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  isLandscape: boolean;
  setIsLandscape: (isLandscape: boolean) => void;
}

const OutletContext = createContext<OutletContextType | null>(null);

const OutletProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  return (
    <OutletContext.Provider
      value={{
        isMobile,
        setIsMobile,
        isLandscape,
        setIsLandscape,
      }}
    >
      {children}
    </OutletContext.Provider>
  );
};

export { OutletContext, OutletProvider };
