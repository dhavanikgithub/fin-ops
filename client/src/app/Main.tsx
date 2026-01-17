'use client';
import React from "react";
import ReduxProvider from "../components/ReduxProvider";
import { HealthCheckProvider } from "../context/HealthCheckContext";
import GlobalHealthCheckModal from "../components/GlobalHealthCheckModal";
import ToastWrapper from "@/components/ToastWrapper";
import { ThemeProvider } from "@/context/ThemeContext";
import App from "@/components/App";
import { usePathname } from "next/navigation";

export default function Main({
    children,
    theme = 'light',
}: Readonly<{
    children: React.ReactNode;
    theme?: 'light' | 'dark';
}>) {
    const pathname = usePathname();
    return (
        <html lang="en" data-theme={theme}>
            <body className={theme}>
                <ThemeProvider initialTheme={theme}>
                    <ToastWrapper>
                        <ReduxProvider>
                            <HealthCheckProvider>
                                <App activeHref={pathname}>
                                    {children}
                                </App>
                                <GlobalHealthCheckModal />
                            </HealthCheckProvider>
                        </ReduxProvider>
                    </ToastWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}