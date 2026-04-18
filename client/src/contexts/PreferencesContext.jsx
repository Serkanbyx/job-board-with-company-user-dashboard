import { useState, useEffect, useCallback } from 'react';
import { PreferencesContext } from './preferencesContextInstance';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const PreferencesProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('jb_theme') || 'system';
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('jb_theme', newTheme);
    applyTheme(newTheme);
  }, []);

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <PreferencesContext.Provider value={{ theme, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
};
