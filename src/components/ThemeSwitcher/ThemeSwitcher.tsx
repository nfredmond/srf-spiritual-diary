import { Sun, Moon, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full p-1 shadow-sm">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onThemeChange(value)}
          className={`relative px-4 py-2 rounded-full transition-all ${
            currentTheme === value
              ? 'text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-label={`Switch to ${label} theme`}
          title={`${label} theme`}
        >
          {currentTheme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-gradient-to-r from-srf-blue to-srf-gold rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
        </button>
      ))}
    </div>
  );
}
