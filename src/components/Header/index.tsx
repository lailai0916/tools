import { Link } from 'react-router';
import {
  Brand,
  Icon,
  IconButton,
  LanguageButton,
  SiteHeader,
  SkipLink,
  ThemeButton,
  useTheme,
} from '@lailai0916/ui';
import { useI18n } from '@/i18n';
import ToolSearch from '@/components/ToolSearch';
import styles from './styles.module.css';

export default function Header({
  navigationOpen,
  onOpenNavigation,
  navigationId,
  className = '',
}: {
  navigationOpen: boolean;
  onOpenNavigation: () => void;
  navigationId: string;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const { resolvedTheme, setPreference } = useTheme();

  return (
    <>
      <SkipLink>{t('site.skipToContent')}</SkipLink>
      <SiteHeader
        fullWidth
        className={`${styles.header} ${className}`}
        mobileAction={
          <IconButton
            variant="header"
            label={t('site.openNavigation')}
            aria-haspopup="dialog"
            aria-expanded={navigationOpen}
            aria-controls={navigationOpen ? navigationId : undefined}
            onClick={onOpenNavigation}
          >
            <Icon icon="lucide:menu" width={17} />
          </IconButton>
        }
        brand={
          <Link to="/" aria-label={t('site.title')}>
            <Brand logoSrc="/logo.svg" name={t('site.title')} />
          </Link>
        }
        actions={
          <>
            <ToolSearch />
            <LanguageButton locale={locale} onLocaleChange={setLocale} />
            <ThemeButton theme={resolvedTheme} onThemeChange={setPreference} />
          </>
        }
      />
    </>
  );
}
