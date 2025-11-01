'use client'
import Navbar from "@/components/Navbar";
import '../styles/App.scss'
import { ReactNode } from "react";

interface AppProps {
    children: ReactNode;
    activeHref: string; // Pass the active route as a prop
}

const App: React.FC<AppProps> = ({ children, activeHref }) => {
    return (
            <div className="app">
                <Navbar activeHref={activeHref} />
                {children}
            </div>
    );
};

export default App;