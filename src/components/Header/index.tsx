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
import { useToolNavigation } from '@/hooks/useToolNavigation';
import type { MessageKey } from '@/i18n/en';
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
  const { tool, title } = useToolNavigation();

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
          <>
            <Link to="/" className={styles.brand} aria-label={t('site.title')}>
              <Brand logoSrc="/logo.svg" name={t('site.title')} />
            </Link>
            <span className={styles.context}>
              {tool ? t(`tools.${tool.key}.name` as MessageKey) : title}
            </span>
          </>
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
