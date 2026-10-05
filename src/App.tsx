import { LaikitProvider, PageContainer, Skeleton, type LinkProps } from '@lailai0916/ui';
import { lazy, Suspense, type ComponentType } from 'react';
import { Link as RouterLink, Route, Routes } from 'react-router';
import { I18nProvider } from './i18n';
import { useI18n } from './i18n';
import Header from './components/Header';
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
  return (
    <LaikitProvider locale={locale} linkComponent={AppLink}>
      <div className={styles.shell}>
        <Header />
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
