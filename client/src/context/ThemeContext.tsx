'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import logger from '@/utils/logger';

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
    initialTheme?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme = 'light' }) => {
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const initializeTheme = () => {
            let finalTheme: Theme = initialTheme;

            try {
                // Check cookie first
                const cookies = document.cookie.split('; ');
                const themeCookie = cookies.find(row => row.startsWith('theme='));
                const savedTheme = themeCookie?.split('=')[1] as Theme;
                
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    finalTheme = savedTheme;
                }

                // Clean up old localStorage value if it exists
                if (localStorage.getItem('theme')) {
                    localStorage.removeItem('theme');
                }
            } catch (error) {
                logger.warn('Error accessing cookies:', error);
            }

            setTheme(finalTheme);
            setMounted(true);

            // Apply theme immediately
            document.documentElement.setAttribute('data-theme', finalTheme);
            document.body.className = finalTheme;
        };

        initializeTheme();
    }, [initialTheme]);

    useEffect(() => {
        if (!mounted) return;

        try {
            // Save theme to cookie (expires in 1 year)
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            document.cookie = `theme=${theme}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
            
            document.documentElement.setAttribute('data-theme', theme);
            document.body.className = theme;
        } catch (error) {
            logger.warn('Error saving theme:', error);
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