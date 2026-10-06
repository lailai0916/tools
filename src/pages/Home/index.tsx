import Hint from '@lailai0916/ui/Hint';
import { Badge, Button, EmptyState, Icon, IconBlock, Panel } from '@lailai0916/ui';
import FavoriteButton from '@/components/FavoriteButton';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useI18n } from '@/i18n';
import { CATEGORY_ORDER, TOOLS } from '@/tools/registry';
import type { MessageKey } from '@/i18n/en';
import { useToolNavigation } from '@/hooks/useToolNavigation';
import { useSavedTools } from '@/hooks/useSavedTools';
import { toggleToolFavorite } from '@/utils/toolStorage';
import { matchesToolSearch } from '@/utils/toolSearch';
import styles from './styles.module.css';

export default function Home() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, recent } = useSavedTools();

  const { query, view, category, title } = useToolNavigation();

  const updateParam = (key: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const source =
      view === 'favorites'
        ? TOOLS.filter((tool) => favorites.includes(tool.id))
        : view === 'recent'
          ? recent.flatMap((id) => TOOLS.filter((tool) => tool.id === id))
          : TOOLS;
    return source.filter((tool) => {
      if (category && tool.category !== category) {
        return false;
      }
      return matchesToolSearch(tool.id, query);
    });
  }, [category, favorites, query, recent, view]);

  const sections = useMemo(
    () =>
      view !== 'all' || category
        ? [{ category: null, items: filtered }]
        : CATEGORY_ORDER.map((sectionCategory) => ({
            category: sectionCategory,
            items: filtered.filter((tool) => tool.category === sectionCategory),
          })).filter((section) => section.items.length > 0),
    [category, filtered, view]
  );

  const hasFilter = Boolean(query.trim() || category);
  const emptyTitle = hasFilter
    ? t('site.noResults')
    : view === 'favorites'
      ? t('site.noFavorites')
      : view === 'recent'
        ? t('site.noRecent')
        : t('site.noResults');
  const emptyDescription = hasFilter
    ? t('site.noResultsDescription')
    : view === 'favorites'
      ? t('site.emptyFavorites')
      : view === 'recent'
        ? t('site.emptyRecent')
        : t('site.noResultsDescription');

  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <h1 className={styles.title}>{title}</h1>
      </header>

      {query && (
        <Button
          size="sm"
          className={styles.queryFilter}
          aria-label={`${t('site.clearSearch')}: ${query}`}
          onClick={() => updateParam('q')}
        >
          <span>{query}</span>
          <Icon icon="lucide:x" />
        </Button>
      )}

      <p className={styles.resultStatus} role="status" aria-live="polite" aria-atomic="true">
        {t('site.searchResults')}: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            icon={
              <Icon
                icon={
                  hasFilter
                    ? 'lucide:search-x'
                    : view === 'favorites'
                      ? 'lucide:star'
                      : view === 'recent'
                        ? 'lucide:history'
                        : 'lucide:search-x'
                }
              />
            }
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                {t('site.showAllTools')}
              </Button>
            }
          />
        </div>
      ) : (
        sections.map(({ category: sectionCategory, items }) => (
          <section key={sectionCategory ?? view} className={styles.section}>
            {sectionCategory && (
              <h2 className={styles.sectionTitle}>
                <span>{t(`category.${sectionCategory}` as MessageKey)}</span>
                <Badge count={items.length} />
              </h2>
            )}
            <div className={styles.grid}>
              {items.map((tool) => {
                const name = t(`tools.${tool.key}.name` as MessageKey);
                const favorite = favorites.includes(tool.id);
                return (
                  <article key={tool.id} className={styles.card}>
                    <Panel className={styles.cardSurface}>
                      <Link to={`/${tool.id}`} className={styles.cardLink}>
                        <IconBlock icon={tool.icon} variant="muted" />
                        <span className={styles.cardCopy}>
                          <Hint label={name}>
                            <span className={styles.cardName}>{name}</span>
                          </Hint>
                          <span className={styles.cardDesc}>
                            {t(`tools.${tool.key}.description` as MessageKey)}
                          </span>
                        </span>
                      </Link>
                      <FavoriteButton
                        name={name}
                        className={styles.favorite}
                        active={favorite}
                        onClick={() => toggleToolFavorite(tool.id)}
                      />
                    </Panel>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
