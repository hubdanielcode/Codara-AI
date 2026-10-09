import { getTheme, saveTheme, applyTheme } from "@/shared/utils/theme";

/* - Limpando o localStorage entre os testes - */

beforeEach(() => {
  localStorage.clear();
});

/* - Testando o getTheme - */

test("should return 'Light' when no theme is stored", () => {
  expect(getTheme()).toBe("Light");
});

test("should return the stored theme from localStorage", () => {
  localStorage.setItem("Theme", "Dark");

  expect(getTheme()).toBe("Dark");
});

/* - Testando o saveTheme - */

test("should save the theme to localStorage", () => {
  saveTheme("Dark");

  expect(localStorage.getItem("Theme")).toBe("Dark");
});

test("should overwrite the existing theme in localStorage", () => {
  saveTheme("Dark");
  saveTheme("Light");

  expect(localStorage.getItem("Theme")).toBe("Light");
});

/* - Testando o applyTheme - */

test("should add 'dark' class to documentElement when theme is Dark", () => {
  applyTheme("Dark");

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("should remove 'dark' class from documentElement when theme is Light", () => {
  document.documentElement.classList.add("dark");

  applyTheme("Light");

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});
