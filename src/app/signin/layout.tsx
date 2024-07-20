"use client";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useLogin } from "~/Context/loginContext";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useLogin();
  const router = useRouter();
  if (isLoggedIn) {
    return router.push("/");
  }

  return <>{children}</>;
};

export default ProtectedLayout;
