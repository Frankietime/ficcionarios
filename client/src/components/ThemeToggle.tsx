import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useThemeStore } from '../stores/themeStore';

export function ThemeToggle() {
  const { isDark, toggleDark } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDark}
      className="h-9 w-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
