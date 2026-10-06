import { TOOLS } from '@/tools/registry';
import { LEGACY_ROUTES } from '@/tools/legacyRoutes';

export const FAVORITES_KEY = 'tools.favorites';
export const RECENT_KEY = 'tools.recent';

const validToolIds = new Set<string>(TOOLS.map((tool) => tool.id));
const cachedIds = new Map<string, string[]>();
const listeners = new Set<() => void>();

function normalizeIds(value: unknown, key: string): string[] {
  const ids = Array.isArray(value)
    ? [
        ...new Set(
          value.flatMap((item) => {
            if (typeof item !== 'string') return [];
            const target = Object.hasOwn(LEGACY_ROUTES, item)
              ? LEGACY_ROUTES[item as keyof typeof LEGACY_ROUTES]
              : undefined;
            const id = target ? target.split('?')[0].slice(1) : item;
            return validToolIds.has(id) ? [id] : [];
          })
        ),
      ]
    : [];
  return key === RECENT_KEY ? ids.slice(0, 18) : ids;
}

export function readToolIds(key: string): string[] {
  const cached = cachedIds.get(key);
  if (cached) return cached;
  let ids: string[] = [];
  try {
    const stored = localStorage.getItem(key) ?? '[]';
    ids = normalizeIds(JSON.parse(stored), key);
    const migrated = JSON.stringify(ids);
    if (stored !== migrated) localStorage.setItem(key, migrated);
  } catch {
    // Keep an in-memory list when storage is unavailable or malformed.
  }
  cachedIds.set(key, ids);
  return ids;
}

export function writeToolIds(key: string, ids: string[]) {
  const next = normalizeIds(ids, key);
  cachedIds.set(key, next);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Browser storage can be unavailable in private contexts.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== FAVORITES_KEY && event.key !== RECENT_KEY) return;
  if (event.key === null) cachedIds.clear();
  else cachedIds.delete(event.key);
  listeners.forEach((listener) => listener());
}

export function subscribeToolStorage(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

export function rememberTool(toolId: string): string[] {
  const next = [toolId, ...readToolIds(RECENT_KEY).filter((id) => id !== toolId)].slice(0, 18);
  writeToolIds(RECENT_KEY, next);
  return readToolIds(RECENT_KEY);
}

export function toggleToolFavorite(toolId: string) {
  const favorites = readToolIds(FAVORITES_KEY);
  writeToolIds(
    FAVORITES_KEY,
    favorites.includes(toolId) ? favorites.filter((id) => id !== toolId) : [toolId, ...favorites]
  );
}
