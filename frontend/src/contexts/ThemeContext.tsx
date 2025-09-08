import React, { createContext, ReactNode, useContext, useEffect } from "react";
import {
  getUserPreferencesByUserId,
  updateUserPreferencesByUserId,
} from "../lib/api";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = React.useState<boolean>(false);

  useEffect(() => {
    // Fetch user preferences on mount
    getUserPreferencesByUserId().then((res) => {
      const viewMode = res.data?.viewMode;
      setDarkMode(viewMode === "dark");
    });
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);

    // Update user preferences
    updateUserPreferencesByUserId({ viewMode: darkMode ? "light" : "dark" });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
// Custom hook untuk menggunakan ThemeContext di komponen lain
