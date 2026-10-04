import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  IconBlock,
  IconButton,
  Input,
  Segmented,
} from '@lailai0916/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
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
  const searchRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get('q') ?? '';
  const requestedView = searchParams.get('view');
  const view: View =
    requestedView === 'favorites' || requestedView === 'recent' ? requestedView : 'all';
  const requestedCategory = searchParams.get('category');
  const category = CATEGORY_ORDER.includes(requestedCategory as ToolCategory)
    ? (requestedCategory as ToolCategory)
    : null;

  useEffect(() => {
    const ownerWindow = searchRef.current?.ownerDocument.defaultView;
    if (!ownerWindow) return;

    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key !== '/' ||
        target?.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    };

    ownerWindow.addEventListener('keydown', focusSearch);
    return () => ownerWindow.removeEventListener('keydown', focusSearch);
  }, []);

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
        <h1 className={styles.title}>{t('site.title')}</h1>
        <p className={styles.tagline}>{t('site.tagline')}</p>
      </header>

      <section className={styles.finder} aria-label={t('site.searchPlaceholder')}>
        <div className={styles.searchWrap}>
          <Icon icon="lucide:search" className={styles.searchIcon} />
          <Input
            ref={searchRef}
            className={styles.search}
            value={query}
            onChange={(event) => updateParam('q', event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
              if (query) {
                updateParam('q');
              } else {
                event.currentTarget.blur();
              }
            }}
            placeholder={t('site.searchPlaceholder')}
            aria-label={t('site.searchPlaceholder')}
            aria-keyshortcuts="/"
          />
          {!query && (
            <kbd className={styles.searchShortcut} aria-hidden="true">
              /
            </kbd>
          )}
          {query && (
            <IconButton
              size="md"
              className={styles.clearSearch}
              onClick={() => updateParam('q')}
              label={t('common.clear')}
            >
              <Icon icon="lucide:x" />
            </IconButton>
          )}
        </div>

        <div className={styles.filterRow}>
          <Segmented<View>
            size="sm"
            orientation="horizontal"
            stackAt={0}
            className={styles.viewTabs}
            ariaLabel={t('site.allTools')}
            value={view}
            onChange={(next) => updateParam('view', next === 'all' ? null : next)}
            items={[
              { value: 'all', label: t('site.viewAll'), icon: 'lucide:grid-2x2' },
              { value: 'favorites', label: t('site.viewFavorites'), icon: 'lucide:star' },
              { value: 'recent', label: t('site.viewRecent'), icon: 'lucide:history' },
            ]}
          />

          <div className={styles.categories} role="group" aria-label={t('site.allCategories')}>
            <Button size="sm" rounded active={!category} onClick={() => updateParam('category')}>
              {t('site.allCategories')}
            </Button>
            {CATEGORY_ORDER.map((item) => (
              <Button
                key={item}
                size="sm"
                rounded
                active={category === item}
                onClick={() => updateParam('category', item)}
              >
                {t(`category.${item}` as MessageKey)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <p className={styles.resultStatus} role="status" aria-live="polite" aria-atomic="true">
        {filtered.length} {t(filtered.length === 1 ? 'site.toolAvailable' : 'site.toolsAvailable')}
      </p>

      {sections.length === 0 ? (
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
          <section key={sectionCategory} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>{t(`category.${sectionCategory}` as MessageKey)}</span>
              <Badge count={items.length} />
            </h2>
            <div className={styles.grid}>
              {items.map((tool) => {
                const name = t(`tools.${tool.key}.name` as MessageKey);
                const favorite = favorites.includes(tool.id);
                return (
                  <Card as="article" padding={0} key={tool.id} className={styles.card}>
                    <Link
                      to={`/${tool.id}`}
                      className={styles.cardLink}
                      onClick={() => rememberTool(tool.id)}
                    >
                      <IconBlock icon={tool.icon} variant="accent" />
                      <span className={styles.cardCopy}>
                        <span className={styles.cardName} title={name}>
                          {name}
                        </span>
                        <span className={styles.cardDesc}>
                          {t(`tools.${tool.key}.description` as MessageKey)}
                        </span>
                      </span>
                    </Link>
                    <IconButton
                      size="md"
                      className={styles.favorite}
                      aria-pressed={favorite}
                      label={favorite ? t('site.removeFavorite') : t('site.addFavorite')}
                      onClick={() => toggleFavorite(tool.id)}
                    >
                      <Icon icon="lucide:star" />
                    </IconButton>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
