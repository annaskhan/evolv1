"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { STORAGE_KEYS, type Theme } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((t: Theme) => {
    const r = t === "system" ? getSystemTheme() : t;
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      setItem(STORAGE_KEYS.THEME, t);
      applyTheme(t);
    },
    [applyTheme],
  );

  useEffect(() => {
    const saved = getItem<Theme>(STORAGE_KEYS.THEME, "system");
    setThemeState(saved);
    applyTheme(saved);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getItem<Theme>(STORAGE_KEYS.THEME, "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
