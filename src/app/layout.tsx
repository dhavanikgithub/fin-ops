import type { Metadata } from "next";
import "../styles/globals.scss"
import ReduxProvider from "../components/ReduxProvider";

export const metadata: Metadata = {
  title: "FinOps",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
