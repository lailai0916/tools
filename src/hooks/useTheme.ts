import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#17181a' : '#f8fafc');
}

export function useTheme() {
  // The theme follows the system by default. A manual toggle overrides it only for
  // the current session (never persisted) — as soon as the OS theme changes, we
  // follow the system again. So there is no separate "auto" mode to manage.
  const [theme, setThemeState] = useState<Theme>(systemTheme);

  const setTheme = useCallback((next: Theme) => {
    apply(next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(
      (document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark') as Theme
    );
  }, [setTheme]);

  // Always follow the system, overriding any manual choice. `sync` re-reads the
  // live system value every time rather than trusting a captured MediaQueryList,
  // and we also re-sync when the tab becomes visible again — covering the common
  // "switch away, change the OS theme, switch back" path.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const next = systemTheme();
      apply(next);
      setThemeState(next);
    };
    sync();
    mq.addEventListener('change', sync);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mq.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { theme, setTheme, toggle };
}
