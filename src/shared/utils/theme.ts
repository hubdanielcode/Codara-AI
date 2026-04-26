export type Theme = "Light" | "Dark";

/* - Pegando o tema - */

const getTheme = () => {
  return (localStorage.getItem("Theme") as Theme) ?? "Light";
};

/* - Salvando o tema - */

const saveTheme = (theme: Theme) => {
  localStorage.setItem("Theme", theme);
};

/* - Usando o tema - */

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "Dark");
};

export { getTheme, saveTheme, applyTheme };
