import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

// Helper function to get OS dark mode preference
function getOSTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Helper function to get the actual theme (resolving "system" to light/dark)
function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getOSTheme();
  }
  return theme as "light" | "dark";
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get stored theme preference
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) return stored;
    
    // If no preference stored, use "system" to follow OS dark mode
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = getResolvedTheme(theme);
    
    // Update DOM
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    
    // Store user preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for OS dark mode changes (when theme is "system")
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const root = document.documentElement;
      const resolvedTheme = getOSTheme();
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    };

    // Modern browsers: use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    
    // Legacy browsers: use addListener (deprecated but still needed for some browsers)
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      // If system, toggle to opposite of current OS setting
      return getOSTheme() === "dark" ? "light" : "dark";
    });
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
