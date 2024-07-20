import { useContext } from "react";
import { LoginContext } from "./LoginContextComponents";

export const useLogin = () => {
  const context = useContext(LoginContext);

  if (context === undefined) {
    throw new Error("useLogin must be used within the provider boundaries");
  }

  return context;
};
