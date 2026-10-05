import { useSyncExternalStore } from 'react';
import { FAVORITES_KEY, RECENT_KEY, readToolIds, subscribeToolStorage } from '@/utils/toolStorage';

const getFavorites = () => readToolIds(FAVORITES_KEY);
const getRecent = () => readToolIds(RECENT_KEY);

export function useSavedTools() {
  const favorites = useSyncExternalStore(subscribeToolStorage, getFavorites);
  const recent = useSyncExternalStore(subscribeToolStorage, getRecent);
  return { favorites, recent };
}
