'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const initializeTheme = () => {
            let initialTheme: Theme = 'light';

            try {
                // Check localStorage first
                const savedTheme = localStorage.getItem('theme') as Theme;
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    initialTheme = savedTheme;
                } else {
                    // Check system preference
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    initialTheme = systemPrefersDark ? 'dark' : 'light';
                }
            } catch (error) {
                console.warn('Error accessing localStorage or matchMedia:', error);
            }

            setTheme(initialTheme);
            setMounted(true);

            // Apply theme immediately
            document.documentElement.setAttribute('data-theme', initialTheme);
            document.body.className = initialTheme;
        };

        initializeTheme();
    }, []);

    useEffect(() => {
        if (!mounted) return;

        try {
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            document.body.className = theme;
        } catch (error) {
            console.warn('Error saving theme:', error);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
};