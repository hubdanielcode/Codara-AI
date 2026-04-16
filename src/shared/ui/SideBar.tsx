import { motion, AnimatePresence } from "framer-motion";

const SideBar = () => {
  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col flex-1 space-y-4 bg-zinc-800 text-white"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        TESTE
      </motion.div>
    </AnimatePresence>
  );
};
export { SideBar };
