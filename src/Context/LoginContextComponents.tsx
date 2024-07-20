"use client";
import React, {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useLayoutEffect,
  useState,
} from "react";
import { z } from "zod";
import { checkAuth } from "~/actions/Login.action";

const userSchema = z.object({
  id: z.number(),
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  user: z.infer<typeof userSchema> | undefined;
  setUser: Dispatch<SetStateAction<z.infer<typeof userSchema> | undefined>>;
};

export const LoginContext = React.createContext<LoginContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {
    return null;
  },
  user: undefined,
  setUser: () => {
    return null;
  },
});

export const LoginContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<undefined | z.infer<typeof userSchema>>();

  useLayoutEffect(() => {
    const check = async () => {
      const response = await checkAuth();
      if (response.status !== 200) {
        setIsLoggedIn(false);
        return response.message;
      }
      setIsLoggedIn(true);
      setUser(response.user);
      return response.message;
    };
    check()
      .then((message?) => {
        console.log(message);
      })
      .catch((error?) => {
        console.log(error);
      });
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,

        setUser,
        user,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
