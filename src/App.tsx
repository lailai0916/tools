import { Route, Routes } from 'react-router';
import { I18nProvider } from './i18n';
import Header from './components/Header';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { TOOLS } from './tools/registry';
import styles from './App.module.css';

export default function App() {
  return (
    <I18nProvider>
      <div className={styles.shell}>
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            {TOOLS.map(({ id, Component }) => (
              <Route key={id} path={`/${id}`} element={<Component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </I18nProvider>
  );
}
