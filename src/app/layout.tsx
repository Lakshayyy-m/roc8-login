import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

import { Toaster } from "~/components/ui/sonner";
import Navbar from "~/components/Navbar";
import { LoginContextProvider } from "~/Context/LoginContextComponents";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roc8 Login",
  description: "App for login and selecting categories",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

//Root layout with TRPC and Login Context provider
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={`${inter.className} h-screen`}>
        <TRPCReactProvider>
          <LoginContextProvider>
            <Navbar />
            {children}
          </LoginContextProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
