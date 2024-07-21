"use client";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useLogin } from "~/Context/loginContext";

//Layout for protected routes
const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useLogin();
  const router = useRouter();
  if (!isLoggedIn) {
    return router.push("/signin");
  }

  return <>{children}</>;
};

export default ProtectedLayout;
