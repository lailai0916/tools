import { useLocation, useSearchParams } from 'react-router';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { CATEGORY_ORDER, TOOLS, type ToolCategory } from '@/tools/registry';

export type ToolView = 'all' | 'favorites' | 'recent';

export function useToolNavigation() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view: ToolView =
    requestedView === 'favorites' || requestedView === 'recent' ? requestedView : 'all';
  const requestedCategory = searchParams.get('category');
  const category = CATEGORY_ORDER.includes(requestedCategory as ToolCategory)
    ? (requestedCategory as ToolCategory)
    : null;
  const tool = TOOLS.find((item) => pathname === `/${item.id}`);
  const title =
    view === 'favorites'
      ? t('site.viewFavorites')
      : view === 'recent'
        ? t('site.viewRecent')
        : category
          ? t(`category.${category}` as MessageKey)
          : t('site.allTools');

  return { view, category, tool, title, query: searchParams.get('q') ?? '' };
}
