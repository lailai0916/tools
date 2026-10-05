export const FAVORITES_KEY = 'tools.favorites';
export const RECENT_KEY = 'tools.recent';

export function readToolIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function writeToolIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Browser storage can be unavailable in private contexts.
  }
}

export function rememberTool(toolId: string): string[] {
  const next = [toolId, ...readToolIds(RECENT_KEY).filter((id) => id !== toolId)].slice(0, 18);
  writeToolIds(RECENT_KEY, next);
  return next;
}
