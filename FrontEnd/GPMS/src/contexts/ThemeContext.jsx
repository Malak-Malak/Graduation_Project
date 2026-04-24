
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Try to read saved preference; otherwise fall back to system preference
    const saved = localStorage.getItem("gpms_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("gpms_theme", mode);
    // Sync html data attribute (useful for any global CSS selectors)
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const setLight = () => setMode("light");
  const setDark = () => setMode("dark");

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      "useThemeContext must be used inside ThemeContextProvider"
    );
  return ctx;
};