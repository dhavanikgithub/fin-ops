'use client'
import Navbar from "@/components/Navbar";
import '../styles/App.scss'
import { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";

interface AppProps {
    children: ReactNode;
    activeHref: string; // Pass the active route as a prop
}

const App: React.FC<AppProps> = ({ children, activeHref }) => {
    return (
        <ThemeProvider>
            <div className="app">
                <Navbar activeHref={activeHref} />
                {children}
            </div>
        </ThemeProvider>
    );
};

export default App;