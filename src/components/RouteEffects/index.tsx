import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { useToolNavigation } from '@/hooks/useToolNavigation';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';

export default function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { tool, title } = useToolNavigation();
  const { t } = useI18n();
  const previousKey = useRef(location.key);
  const positions = useRef(new Map<string, number>());

  useEffect(() => {
    document.title = `${tool ? t(`tools.${tool.key}.name` as MessageKey) : location.pathname === '/' ? title : '404'} · ${t('site.title')}`;
  }, [location.pathname, t, title, tool]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const savePosition = () => positions.current.set(previousKey.current, window.scrollY);
    window.addEventListener('scroll', savePosition, { passive: true });
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener('scroll', savePosition);
    };
  }, []);

  useLayoutEffect(() => {
    if (previousKey.current === location.key) return;
    previousKey.current = location.key;
    const top = navigationType === 'POP' ? (positions.current.get(location.key) ?? 0) : 0;
    window.scrollTo({ top, behavior: 'instant' });
    const frame = requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      window.scrollTo({ top, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, navigationType]);

  return null;
}
