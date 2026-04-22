import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Missing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-full bg-zinc-900">
      <motion.div
        className="flex flex-col rounded-lg bg-zinc-800 border h-fit p-6 border-zinc-700"
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col flex-1">
          <span className="text-white font-bold text-3xl text-center">
            Erro 404!
          </span>
          <span className="text-zinc-400 font-semibold text-lg my-6">
            Página não encontrada!
          </span>

          <div
            className="flex cursor-pointer text-blue-600 hover:text-blue-400 mr-2"
            role="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2" />
            Para a página de Login!
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export { Missing };
