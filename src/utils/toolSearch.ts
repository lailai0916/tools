import { en, type MessageKey } from '@/i18n/en';
import { zhHans } from '@/i18n/zh-Hans';
import { TOOLS } from '@/tools/registry';

const normalize = (value: string) => value.normalize('NFKC').toLowerCase();

const searchText = new Map(
  TOOLS.map((tool) => {
    const name = `tools.${tool.key}.name` as MessageKey;
    const description = `tools.${tool.key}.description` as MessageKey;
    return [
      tool.id,
      normalize([tool.id, en[name], zhHans[name], en[description], zhHans[description]].join(' ')),
    ];
  })
);

export function matchesToolSearch(toolId: string, query: string): boolean {
  const text = searchText.get(toolId) ?? '';
  return normalize(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => text.includes(term));
}
