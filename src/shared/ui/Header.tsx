import { useThemeContext } from "@/shared/hooks/useThemeContext";
import { motion } from "framer-motion";
import { Code2, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ openSideBar }: { openSideBar: () => void }) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();

  const today = new Date().toLocaleDateString("pt-BR");
  const hours = new Date().toLocaleTimeString("pt-BR");

  return (
    <div
      className={`h-full flex flex-col overflow-hidden ${
        theme === "Dark" ? "bg-zinc-900" : "bg-stone-100"
      }`}
    >
      <motion.header
        className={`px-4 py-3 flex items-center justify-between border-b ${
          theme === "Dark"
            ? "bg-zinc-800 border-zinc-700"
            : "bg-white border-stone-200"
        }`}
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 bg-blue-600 rounded-xl">
            <Code2 className="h-5 w-5 text-white" />
          </div>

          <div>
            <p
              className={`font-semibold text-lg ${
                theme === "Dark" ? "text-white" : "text-stone-800"
              }`}
            >
              Codara AI
            </p>
            <p
              className={`font-semibold text-sm ${
                theme === "Dark" ? "text-zinc-400" : "text-stone-500"
              }`}
            >
              Sessão iniciada em {today}, às {hours}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            className="flex items-center gap-2 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openSideBar}
          >
            <Menu
              className={`h-5 w-5 cursor-pointer ${
                theme === "Dark"
                  ? "text-zinc-500 hover:text-white"
                  : "text-stone-400 hover:text-stone-800"
              }`}
            />
          </motion.button>

          <motion.button
            className="flex items-center gap-2 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            <LogOut
              className={`h-5 w-5 cursor-pointer ${
                theme === "Dark"
                  ? "text-zinc-500 hover:text-white"
                  : "text-stone-500 hover:text-black"
              }`}
            />
          </motion.button>
        </div>
      </motion.header>
    </div>
  );
};

export { Header };
