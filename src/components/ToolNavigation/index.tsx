import { ButtonLink, Dialog, Icon, IconButton } from '@lailai0916/ui';
import type { MouseEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { useToolNavigation, type ToolView } from '@/hooks/useToolNavigation';
import { CATEGORY_ORDER, TOOLS, type ToolCategory } from '@/tools/registry';
import styles from './styles.module.css';

const CATEGORY_ICONS: Record<ToolCategory, string> = {
  converter: 'lucide:arrow-left-right',
  text: 'lucide:type',
  crypto: 'lucide:shield-check',
  web: 'lucide:globe',
  development: 'lucide:code-2',
  math: 'lucide:calculator',
  generator: 'lucide:wand-sparkles',
  fun: 'lucide:gamepad-2',
};

function NavigationLinks({
  onNavigate,
}: {
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { view, category, tool } = useToolNavigation();
  const home = pathname === '/';
  const target = (nextView: ToolView, nextCategory?: ToolCategory) => {
    const params = new URLSearchParams(home ? searchParams : undefined);
    params.delete('view');
    params.delete('category');
    if (nextView !== 'all') params.set('view', nextView);
    if (nextCategory) params.set('category', nextCategory);
    const query = params.toString();
    return query ? `/?${query}` : '/';
  };
  const current = (selected: boolean) =>
    selected ? (home ? ('page' as const) : ('location' as const)) : undefined;

  return (
    <nav className={styles.navigation} aria-label={t('site.toolNavigation')}>
      <div className={styles.links}>
        {(
          [
            ['all', 'site.allTools', 'lucide:grid-2x2'],
            ['favorites', 'site.viewFavorites', 'lucide:star'],
            ['recent', 'site.viewRecent', 'lucide:history'],
          ] as const
        ).map(([item, label, icon]) => (
          <ButtonLink
            key={item}
            to={target(item)}
            size="sm"
            variant="ghost"
            fullWidth
            className={styles.link}
            leftIcon={<Icon icon={icon} width={18} />}
            aria-current={current(home && view === item && (item !== 'all' || !category))}
            onClick={onNavigate}
          >
            <span className={styles.label}>{t(label)}</span>
            {item === 'all' && <span className={styles.count}>{TOOLS.length}</span>}
          </ButtonLink>
        ))}
      </div>
      <div className={styles.group}>
        <h2 className={styles.groupTitle}>{t('site.toolCategories')}</h2>
        <div className={styles.links}>
          {CATEGORY_ORDER.map((item) => (
            <ButtonLink
              key={item}
              to={target('all', item)}
              size="sm"
              variant="ghost"
              fullWidth
              className={styles.link}
              leftIcon={<Icon icon={CATEGORY_ICONS[item]} width={18} />}
              aria-current={current(
                home ? view === 'all' && category === item : tool?.category === item
              )}
              onClick={onNavigate}
            >
              <span className={styles.label}>{t(`category.${item}` as MessageKey)}</span>
              <span className={styles.count}>
                {TOOLS.filter((entry) => entry.category === item).length}
              </span>
            </ButtonLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function ToolNavigation({
  open,
  onClose,
  dialogId,
}: {
  open: boolean;
  onClose: () => void;
  dialogId: string;
}) {
  const { t } = useI18n();
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    onClose();
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
  };

  return (
    <>
      <aside className={styles.sidebar} aria-label={t('site.toolNavigation')}>
        <NavigationLinks onNavigate={navigate} />
      </aside>
      {open && (
        <Dialog
          open
          id={dialogId}
          label={t('site.toolNavigation')}
          onClose={onClose}
          className={styles.drawer}
        >
          <div className={styles.heading}>
            <span>{t('site.toolNavigation')}</span>
            <IconButton variant="header" label={t('site.closeNavigation')} onClick={onClose}>
              <Icon icon="lucide:x" width={17} />
            </IconButton>
          </div>
          <NavigationLinks onNavigate={navigate} />
        </Dialog>
      )}
    </>
  );
}
