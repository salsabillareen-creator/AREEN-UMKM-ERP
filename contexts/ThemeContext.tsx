import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_THEME = {
  primary: '#22c55e', // Tailwind green-500, matches the image
  darkBg: '#111827',  // Tailwind gray-900, a bit darker for better contrast
};

interface ThemeContextType {
    primaryColor: string;
    darkBgColor: string;
    saveTheme: (theme: { primary: string; darkBg: string }) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [primaryColor, setPrimaryColor] = useState(DEFAULT_THEME.primary);
    const [darkBgColor, setDarkBgColor] = useState(DEFAULT_THEME.darkBg);

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('app-theme');
            if (savedTheme) {
                const { primary, darkBg } = JSON.parse(savedTheme);
                if (primary) setPrimaryColor(primary);
                if (darkBg) setDarkBgColor(darkBg);
            }
        } catch (error) {
            console.error("Failed to parse theme from localStorage", error);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', primaryColor);
        root.style.setProperty('--color-dark-bg', darkBgColor);
    }, [primaryColor, darkBgColor]);

    const saveTheme = (newTheme: { primary: string, darkBg: string }) => {
        setPrimaryColor(newTheme.primary);
        setDarkBgColor(newTheme.darkBg);
        localStorage.setItem('app-theme', JSON.stringify(newTheme));
    };
    
    const value = {
        primaryColor,
        darkBgColor,
        saveTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};