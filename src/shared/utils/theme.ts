export type Theme = "Light" | "Dark";

/* - Pegando o Tema - */

const getTheme = () => {
  return (localStorage.getItem("Theme") as Theme) ?? "Light";
};

/* - Salvando o Tema - */

const saveTheme = (theme: Theme) => {
  localStorage.setItem("Theme", theme);
};

/* - Usando o Tema - */

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "Dark");
};

export { getTheme, saveTheme, applyTheme };
