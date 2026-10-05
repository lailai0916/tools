import { LaikitProvider, PageContainer, Skeleton, type LinkProps } from '@lailai0916/ui';
import { lazy, Suspense, useEffect, useId, useState, type ComponentType } from 'react';
import { Link as RouterLink, Route, Routes, useLocation } from 'react-router';
import { I18nProvider } from './i18n';
import { useI18n } from './i18n';
import Header from './components/Header';
import ToolNavigation from './components/ToolNavigation';
import RouteEffects from './components/RouteEffects';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { TOOLS } from './tools/registry';
import styles from './App.module.css';

const toolModules = import.meta.glob<{ default: ComponentType }>('./tools/*/index.tsx');
const toolRoutes = TOOLS.map((tool) => {
  const load = toolModules[`./tools/${tool.id}/index.tsx`];
  if (!load) {
    throw new Error(`Missing tool module: ${tool.id}`);
  }
  return { ...tool, Component: lazy(load) };
});

function ToolRoute({ Component }: { Component: ComponentType }) {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className={styles.loading} role="status">
          <Skeleton width={80} height={20} />
          <span className={styles.srOnly}>{t('common.loading')}</span>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

function Application() {
  const { locale } = useI18n();
  const location = useLocation();
  const [navigationLocation, setNavigationLocation] = useState<string | null>(null);
  const dialogId = useId();
  const navigationOpen = navigationLocation === location.key;

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 981px)');
    const closeNavigation = () => setNavigationLocation(null);
    const onResize = () => {
      if (desktop.matches) closeNavigation();
    };
    window.addEventListener('popstate', closeNavigation);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('popstate', closeNavigation);
      desktop.removeEventListener('change', onResize);
    };
  }, []);
  return (
    <LaikitProvider locale={locale} linkComponent={AppLink}>
      <RouteEffects />
      <div className={styles.shell}>
        <Header
          navigationOpen={navigationOpen}
          onOpenNavigation={() => setNavigationLocation(location.key)}
          navigationId={dialogId}
          className={styles.header}
        />
        <ToolNavigation
          open={navigationOpen}
          onClose={() => setNavigationLocation(null)}
          dialogId={dialogId}
        />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <PageContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              {toolRoutes.map(({ id, Component }) => (
                <Route key={id} path={`/${id}`} element={<ToolRoute Component={Component} />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageContainer>
        </main>
      </div>
    </LaikitProvider>
  );
}

function AppLink({ to, href, ...props }: LinkProps) {
  const target = to ?? href ?? '/';
  return target.startsWith('/') && !target.startsWith('//') ? (
    <RouterLink {...props} to={target} />
  ) : (
    <a {...props} href={target} />
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Application />
    </I18nProvider>
  );
}
