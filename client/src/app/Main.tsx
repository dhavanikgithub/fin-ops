'use client';
import React from "react";
import ReduxProvider from "../components/ReduxProvider";
import { HealthCheckProvider } from "../context/HealthCheckContext";
import GlobalHealthCheckModal from "../components/GlobalHealthCheckModal";
import ToastWrapper from "@/components/ToastWrapper";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Main({
    children,
    theme = 'light',
}: Readonly<{
    children: React.ReactNode;
    theme?: 'light' | 'dark';
}>) {
    return (
        <html lang="en" data-theme={theme}>
            <body className={theme}>
                <ThemeProvider initialTheme={theme}>
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