import { Sun, Moon, BookOpen } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const themes: Array<{ value: Theme; icon: any; label: string }> = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'sepia', icon: BookOpen, label: 'Sepia' },
  ];

  return (
    <div className="theme-pill-group flex items-center gap-2 rounded-full p-1 shadow-sm backdrop-blur-sm">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onThemeChange(value)}
          className={`theme-pill-button relative px-4 py-2 rounded-full transition-all ${
            currentTheme === value ? 'theme-pill-indicator text-white' : ''
          }`}
          aria-label={`Switch to ${label} theme`}
          title={`${label} theme`}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">{label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
