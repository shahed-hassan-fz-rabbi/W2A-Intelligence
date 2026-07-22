"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("w2a_theme="))
        ?.split("=")[1] || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `w2a_theme=${next}; path=/; max-age=31536000`;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);