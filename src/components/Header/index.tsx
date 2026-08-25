import { Link } from 'react-router';
import { ThemeControl } from '@lailai/ui';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function Header() {
  const { locale, setLocale, t } = useI18n();

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {t('site.skipToContent')}
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            <img src="/logo.svg" alt="" className={styles.logo} />
            <span>{t('site.title')}</span>
          </Link>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setLocale(locale === 'zh-Hans' ? 'en' : 'zh-Hans')}
              aria-label={t('site.switchLanguage')}
            >
              {locale === 'zh-Hans' ? '中' : 'EN'}
            </button>
            <ThemeControl
              variant="compact"
              labels={{
                system: t('site.themeSystem'),
                light: t('site.themeLight'),
                dark: t('site.themeDark'),
              }}
            />
          </div>
        </div>
      </header>
    </>
  );
}
