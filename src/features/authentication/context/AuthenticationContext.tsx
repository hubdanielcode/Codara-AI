import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getUsers } from "../service/authenticationService";

export interface AuthenticationContextType {
  /* - Dados do Usuário - */

  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;

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

  /* - Pegando o nome do usuário logado - */

  useEffect(() => {
    const fetchActualUser = async () => {
      if (!session) {
        return;
      }
      const data = await getUsers(session.user.id);

      setName(data.name);
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

        /* - Funções - */

        clearContextData,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
