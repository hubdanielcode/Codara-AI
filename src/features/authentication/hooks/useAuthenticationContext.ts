import { useContext } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";

const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      "AuthenticationContext must be used inside an AuthenticationProvider",
    );
  }
  return context;
};

export { useAuthenticationContext };
