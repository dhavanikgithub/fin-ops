import type { Metadata } from "next";
import "../styles/globals.scss"
import ReduxProvider from "../components/ReduxProvider";
import { HealthCheckProvider } from "../context/HealthCheckContext";
import GlobalHealthCheckModal from "../components/GlobalHealthCheckModal";
import ToastWrapper from "@/components/ToastWrapper";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: {
    template: "FinOps - %s",
    default: "FinOps",
  },
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
        <ThemeProvider>
          <ToastWrapper>
            <ReduxProvider>
              <HealthCheckProvider>
                {children}
                <GlobalHealthCheckModal />
              </HealthCheckProvider>
            </ReduxProvider>
          </ToastWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
