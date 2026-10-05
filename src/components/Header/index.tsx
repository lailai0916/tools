import { Link } from 'react-router';
import { Brand, IconButton, SiteHeader, SkipLink, ThemeControl } from '@lailai0916/ui';
import { useI18n } from '@/i18n';

export default function Header() {
  const { locale, setLocale, t } = useI18n();

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
            <IconButton
              size="sm"
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
          </>
        }
      />
    </>
  );
}
