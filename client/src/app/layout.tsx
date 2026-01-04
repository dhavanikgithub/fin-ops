import type { Metadata } from "next";
import "../styles/globals.scss"
import Main from "./Main";
import logger from "@/utils/logger";
import toast from "react-hot-toast";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const metadata: Metadata = {
  title: {
    template: "FinOps - %s",
    default: "FinOps",
  },
  description: "",
};


async function getInitialSettings(): Promise<'light' | 'dark'> {
  try {
    return ((await cookies()).get('theme')?.value || 'light') as 'light' | 'dark';
  } catch (error) {
    return 'light';
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getInitialSettings();
  
  return (
    <Main theme={theme}>
      {children}
    </Main>
  );
}
