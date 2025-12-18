import { Moon, Sun, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === "light") return <Moon className="h-5 w-5" />;
    if (theme === "dark") return <Sun className="h-5 w-5" />;
    // "system" theme - show device icon
    return <Smartphone className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to light mode";
    return "Using system theme (OS dark mode)";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="hover-elevate active-elevate-2"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeToggle() {
  try {
    return <ThemeToggleInner />;
  } catch (error) {
    // Fallback if ThemeProvider is not in context
    return (
      <Button
        variant="ghost"
        size="icon"
        data-testid="button-theme-toggle"
        className="hover-elevate active-elevate-2"
        disabled
      >
        <Moon className="h-5 w-5 opacity-50" />
        <span className="sr-only">Theme toggle</span>
      </Button>
    );
  }
}
