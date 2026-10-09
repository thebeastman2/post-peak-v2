import { useState, useEffect } from 'react';
import { colorSchemes, defaultScheme } from '@/data/colorSchemes';

const varMap = {
  primary: '--pp-primary',
  accent: '--pp-accent',
  bg: '--pp-bg',
  card: '--pp-card',
  text: '--pp-text',
  textMuted: '--pp-text-muted',
  border: '--pp-border',
};

export function useColorScheme() {
  const [schemeId, setSchemeId] = useState(() => {
    return localStorage.getItem('pp-scheme') || defaultScheme.id;
  });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('pp-theme') || 'light';
  });

  useEffect(() => {
    const scheme = colorSchemes.find(s => s.id === schemeId) || defaultScheme;
    const colors = scheme[themeMode] || scheme.light;
    const root = document.documentElement;
    Object.entries(varMap).forEach(([key, cssVar]) => {
      if (colors[key]) {
        root.style.setProperty(cssVar, colors[key]);
      }
    });
    localStorage.setItem('pp-scheme', schemeId);
    localStorage.setItem('pp-theme', themeMode);
  }, [schemeId, themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { schemeId, setSchemeId, themeMode, setThemeMode, toggleTheme };
}