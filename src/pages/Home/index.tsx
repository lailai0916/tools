import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Icon } from '@iconify/react';
import { EmptyState } from '@lailai/ui';
import { useI18n } from '@/i18n';
import { CATEGORY_ORDER, TOOLS, type ToolCategory } from '@/tools/registry';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type View = 'all' | 'favorites' | 'recent';

const FAVORITES_KEY = 'tools.favorites';
const RECENT_KEY = 'tools.recent';

function readToolIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeToolIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Browser storage can be unavailable in private contexts.
  }
}

export default function Home() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [favorites, setFavorites] = useState(() => readToolIds(FAVORITES_KEY));
  const [recent, setRecent] = useState(() => readToolIds(RECENT_KEY));

  const query = searchParams.get('q') ?? '';
  const requestedView = searchParams.get('view');
  const view: View =
    requestedView === 'favorites' || requestedView === 'recent' ? requestedView : 'all';
  const requestedCategory = searchParams.get('category');
  const category = CATEGORY_ORDER.includes(requestedCategory as ToolCategory)
    ? (requestedCategory as ToolCategory)
    : null;

  const updateParam = (key: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const toggleFavorite = (toolId: string) => {
    setFavorites((current) => {
      const next = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [toolId, ...current];
      writeToolIds(FAVORITES_KEY, next);
      return next;
    });
  };

  const rememberTool = (toolId: string) => {
    setRecent((current) => {
      const next = [toolId, ...current.filter((id) => id !== toolId)].slice(0, 18);
      writeToolIds(RECENT_KEY, next);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const source =
      view === 'favorites'
        ? TOOLS.filter((tool) => favorites.includes(tool.id))
        : view === 'recent'
          ? recent.flatMap((id) => TOOLS.filter((tool) => tool.id === id))
          : TOOLS;
    const normalizedQuery = query.trim().toLowerCase();

    return source.filter((tool) => {
      if (category && tool.category !== category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const name = t(`tools.${tool.key}.name` as MessageKey).toLowerCase();
      const description = t(`tools.${tool.key}.description` as MessageKey).toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        tool.id.includes(normalizedQuery)
      );
    });
  }, [category, favorites, query, recent, t, view]);

  const sections = useMemo(
    () =>
      CATEGORY_ORDER.map((sectionCategory) => ({
        category: sectionCategory,
        items: filtered.filter((tool) => tool.category === sectionCategory),
      })).filter((section) => section.items.length > 0),
    [filtered]
  );

  const emptyDescription =
    view === 'favorites'
      ? t('site.emptyFavorites')
      : view === 'recent'
        ? t('site.emptyRecent')
        : t('site.noResults');

  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          {TOOLS.length} {t('site.toolsAvailable')}
        </p>
        <h1 className={styles.title}>{t('site.title')}</h1>
        <p className={styles.tagline}>{t('site.tagline')}</p>
      </header>

      <section className={styles.finder} aria-label={t('site.searchPlaceholder')}>
        <div className={styles.searchWrap}>
          <Icon icon="lucide:search" className={styles.searchIcon} />
          <input
            className={styles.search}
            value={query}
            onChange={(event) => updateParam('q', event.target.value)}
            placeholder={t('site.searchPlaceholder')}
            aria-label={t('site.searchPlaceholder')}
          />
          {query && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => updateParam('q')}
              aria-label={t('common.clear')}
            >
              <Icon icon="lucide:x" />
            </button>
          )}
        </div>

        <div className={styles.viewTabs} role="group" aria-label={t('site.allTools')}>
          {(['all', 'favorites', 'recent'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={styles.viewTab}
              aria-pressed={view === item}
              onClick={() => updateParam('view', item === 'all' ? null : item)}
            >
              <Icon
                icon={
                  item === 'all'
                    ? 'lucide:grid-2x2'
                    : item === 'favorites'
                      ? 'lucide:star'
                      : 'lucide:history'
                }
              />
              {t(`site.view${item[0].toUpperCase()}${item.slice(1)}` as MessageKey)}
            </button>
          ))}
        </div>

        <div className={styles.categories} aria-label={t('site.allCategories')}>
          <button
            type="button"
            className={styles.category}
            aria-pressed={!category}
            onClick={() => updateParam('category')}
          >
            {t('site.allCategories')}
          </button>
          {CATEGORY_ORDER.map((item) => (
            <button
              key={item}
              type="button"
              className={styles.category}
              aria-pressed={category === item}
              onClick={() => updateParam('category', item)}
            >
              {t(`category.${item}` as MessageKey)}
            </button>
          ))}
        </div>
      </section>

      {sections.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            icon={<Icon icon="lucide:search-x" />}
            title={t('site.noResults')}
            description={emptyDescription}
          />
        </div>
      ) : (
        sections.map(({ category: sectionCategory, items }) => (
          <section key={sectionCategory} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>{t(`category.${sectionCategory}` as MessageKey)}</span>
              <span className={styles.sectionCount}>{items.length}</span>
            </h2>
            <div className={styles.grid}>
              {items.map((tool) => {
                const name = t(`tools.${tool.key}.name` as MessageKey);
                const favorite = favorites.includes(tool.id);
                return (
                  <article key={tool.id} className={styles.card}>
                    <Link
                      to={`/${tool.id}`}
                      className={styles.cardLink}
                      onClick={() => rememberTool(tool.id)}
                    >
                      <span className={styles.cardIcon}>
                        <Icon icon={tool.icon} />
                      </span>
                      <span className={styles.cardName}>{name}</span>
                      <span className={styles.cardDesc}>
                        {t(`tools.${tool.key}.description` as MessageKey)}
                      </span>
                    </Link>
                    <button
                      type="button"
                      className={styles.favorite}
                      aria-pressed={favorite}
                      aria-label={favorite ? t('site.removeFavorite') : t('site.addFavorite')}
                      onClick={() => toggleFavorite(tool.id)}
                    >
                      <Icon icon={favorite ? 'lucide:star' : 'lucide:star'} />
                    </button>
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
