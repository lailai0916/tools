import { Link } from 'react-router';
import { Brand, LanguageButton, SiteHeader, SkipLink, ThemeButton, useTheme } from '@lailai0916/ui';
import { useI18n } from '@/i18n';

export default function Header() {
  const { locale, setLocale, t } = useI18n();
  const { resolvedTheme, setPreference } = useTheme();

  return (
    <>
      <SkipLink>{t('site.skipToContent')}</SkipLink>
      <SiteHeader
        brand={
          <Link to="/" aria-label={t('site.title')}>
            <Brand logoSrc="/logo.svg" name={t('site.title')} />
          </Link>
        }
        actions={
          <>
            <LanguageButton locale={locale} onLocaleChange={setLocale} />
            <ThemeButton theme={resolvedTheme} onThemeChange={setPreference} />
          </>
        }
      />
    </>
  );
}
