import { useThemeContext } from "@/shared/hooks/useThemeContext";

const Footer = () => {
  const { theme } = useThemeContext();

  return (
    <footer
      className={`px-4 py-3 flex items-center justify-center border-t ${
        theme === "Dark"
          ? "bg-zinc-800 border-zinc-700"
          : "bg-white border-stone-200"
      }`}
    >
      <span
        className={`text-sm ${theme === "Dark" ? "text-white" : "text-black"}`}
      >
        © {new Date().getFullYear()}{" "}
        <strong className={theme === "Dark" ? "text-white" : "text-black"}>
          Codara AI
        </strong>
        Todos os direitos reservados.
      </span>
    </footer>
  );
};

export { Footer };
