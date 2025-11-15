import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'sepia';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('srf-theme') as Theme;
    if (stored && ['light', 'dark', 'sepia'].includes(stored)) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    root.classList.add(`theme-${newTheme}`);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('srf-theme', newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    setTheme: changeTheme,
  };
}
