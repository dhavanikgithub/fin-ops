import type { Metadata } from "next";
import "../styles/globals.scss"
import ReduxProvider from "../components/ReduxProvider";
import { HealthCheckProvider } from "../context/HealthCheckContext";
import GlobalHealthCheckModal from "../components/GlobalHealthCheckModal";

// Import test utils in development mode
if (process.env.NODE_ENV === 'development') {
  import("../utils/healthCheckTestUtils");
}

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
          <HealthCheckProvider>
            {children}
            <GlobalHealthCheckModal />
          </HealthCheckProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
