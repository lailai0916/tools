import { Link } from 'react-router';
import { Brand, IconButton, ThemeControl } from '@lailai/ui';
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
            <Brand logoSrc="/logo.svg" name={t('site.title')} />
          </Link>
          <div className={styles.actions}>
            <IconButton
              size="small"
              className={styles.languageButton}
              label={t('site.switchLanguage')}
              onClick={() => setLocale(locale === 'zh-Hans' ? 'en' : 'zh-Hans')}
            >
              {locale === 'zh-Hans' ? '中' : 'EN'}
            </IconButton>
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
