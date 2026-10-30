
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Theme } from "@/types/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(
  null
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("neutral");

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme;

    if (
      currentTheme === "light" ||
      currentTheme === "neutral" ||
      currentTheme === "dark"
    ) {
      setTheme(currentTheme);
    }
  }, []);

  function changeTheme(nextTheme: Theme) {
    setTheme(nextTheme);

    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem("sabi-theme", nextTheme);
    } catch {
      // The theme still works if storage is unavailable.
    }
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: changeTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
