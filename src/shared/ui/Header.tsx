import { motion } from "framer-motion";
import { Code2, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ openSideBar }: { openSideBar: () => void }) => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("pt-BR");
  const hours = new Date().toLocaleTimeString("pt-BR");

  return (
    <div className="h-full bg-zinc-900 flex flex-col overflow-hidden">
      <motion.header
        className="bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between"
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 bg-blue-600 rounded-xl">
            <Code2 className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-white font-semibold text-lg">Codara AI</p>
            <p className="text-zinc-400 font-semibold text-sm">
              Sessão iniciada em {today}, às {hours}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            className="flex items-center gap-2 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            <LogOut className="h-5 w-5 text-zinc-500 hover:text-white cursor-pointer" />
          </motion.button>

          <motion.button
            className="flex items-center gap-2 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openSideBar}
          >
            <Menu className="h-5 w-5 text-zinc-500 hover:text-white cursor-pointer" />
          </motion.button>
        </div>
      </motion.header>
    </div>
  );
};
export { Header };
