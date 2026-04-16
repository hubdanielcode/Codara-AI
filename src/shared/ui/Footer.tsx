const Footer = () => {
  return (
    <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-3 flex items-center justify-center">
      <span className="text-white text-sm">
        © {new Date().getFullYear()} <strong>Coldara AI</strong> Todos os
        direitos reservados.
      </span>
    </div>
  );
};
export { Footer };
