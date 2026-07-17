import { Route, Routes } from 'react-router';
import { useTheme } from './hooks/useTheme';
import styles from './App.module.css';

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          lailai&apos;s Tools
        </a>
        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Placeholder />} />
        </Routes>
      </main>
    </div>
  );
}

function Placeholder() {
  return (
    <div className={styles.placeholder}>
      <h1>lailai&apos;s Tools</h1>
      <p>Handy tools for developers.</p>
    </div>
  );
}
