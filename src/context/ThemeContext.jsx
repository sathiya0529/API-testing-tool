import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'apit.theme';
const ThemeContext = createContext(null);
const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => { try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; } });
  const [sysDark, setSysDark] = useState(systemDark);
  const resolved = theme === 'system' ? (sysDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const on = (e) => setSysDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = resolved; }, [resolved]);

  const setTheme = useCallback((t) => { setThemeState(t); try { localStorage.setItem(KEY, t); } catch { /* ignore */ } }, []);
  const toggle = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved, setTheme]);
  const value = useMemo(() => ({ theme, resolved, setTheme, toggle }), [theme, resolved, setTheme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
