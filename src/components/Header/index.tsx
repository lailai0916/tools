import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function Header() {
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        {t('site.title')}
      </Link>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setLocale(locale === 'zh-Hans' ? 'en' : 'zh-Hans')}
          aria-label="Switch language"
        >
          {locale === 'zh-Hans' ? '中' : 'EN'}
        </button>
        <button type="button" className={styles.iconBtn} onClick={toggle} aria-label="Toggle theme">
          <Icon icon={theme === 'dark' ? 'lucide:sun' : 'lucide:moon'} />
        </button>
      </div>
    </header>
  );
}
