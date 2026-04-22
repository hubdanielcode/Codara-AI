import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getUsers } from "../service/authenticationService";

export interface AuthenticationContextType {
  /* - Dados do Usuário - */

  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  photo: File | null;
  setPhoto: (photo: File | null) => void;
  userId: string | null;
  setUserId: (userId: string) => void;

  /* - Funções - */

  clearContextData: () => void;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(
  null,
);

const AuthenticationProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) => {
  /* - Dados do Usuário - */

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(session?.user.id ?? null);

  /* - Pegando o nome do usuário logado - */

  useEffect(() => {
    const fetchActualUser = async () => {
      if (!session) return;

      try {
        const data = await getUsers(session.user.id);
        setName(data.name);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchActualUser();
  }, [session]);

  /* - Funções - */

  const clearContextData = () => {
    setName("");
    setEmail("");
  };

  return (
    <AuthenticationContext.Provider
      value={{
        /* - Dados do Usuário - */

        name,
        setName,
        email,
        setEmail,
        photo,
        setPhoto,
        userId,
        setUserId,

        /* - Funções - */

        clearContextData,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
