import { createContext, useState, type ReactNode } from "react";
import { applyTheme, getTheme, saveTheme, type Theme } from "../utils/theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(getTheme);

  const toggleTheme = () => {
    const newTheme = theme === "Light" ? "Dark" : "Light";

    setTheme(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
