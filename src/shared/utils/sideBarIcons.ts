import { FaPlus, FaClockRotateLeft, FaGear } from "react-icons/fa6";
import type { IconType } from "react-icons/lib";

export type SideBarIcon = {
  label: string;
  icon: IconType;
};

const sideBarIcons: SideBarIcon[] = [
  { label: "Novo Bate-Papo", icon: FaPlus },
  { label: "Histórico de Correções", icon: FaClockRotateLeft },
  { label: "Preferências do Usuário", icon: FaGear },
];

export { sideBarIcons };
