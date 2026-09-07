import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'sepia';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    let stored: Theme | null = null;
    try { stored = localStorage.getItem('srf-theme') as Theme; } catch { return; }
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
    try { localStorage.setItem('srf-theme', newTheme); } catch { /* Appearance applies for this visit only. */ }
    applyTheme(newTheme);
  };

  return {
    theme,
    setTheme: changeTheme,
  };
}
