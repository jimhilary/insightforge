import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

const DarkModeToggle = ({ isDark, toggle }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full w-10 h-10 transition-all hover:scale-110"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-transform rotate-0" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 transition-transform rotate-0" />
      )}
    </Button>
  );
};

export default DarkModeToggle;

