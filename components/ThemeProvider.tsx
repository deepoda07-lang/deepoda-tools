"use client";
import { createContext, useContext } from "react";

const ThemeContext = createContext<{ theme: "light" }>({ theme: "light" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={{ theme: "light" }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
