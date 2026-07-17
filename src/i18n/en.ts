// English is the source of truth. zh-Hans.ts mirrors these keys.
export const en = {
  'site.title': "lailai's Tools",
  'site.tagline': 'Handy tools for developers.',
  'site.allTools': 'All tools',
  'site.searchPlaceholder': 'Search tools',
  'site.noResults': 'No matching tools.',

  'common.back': 'Back',
  'common.clear': 'Clear',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.input': 'Input',
  'common.output': 'Output',

  'category.converter': 'Converter',
  'category.crypto': 'Crypto',
  'category.web': 'Web',
  'category.text': 'Text',
  'category.generator': 'Generator',

  'tools.jsonFormat.name': 'JSON Formatter',
  'tools.jsonFormat.description': 'Prettify or minify JSON, with error reporting.',
  'tools.jsonFormat.placeholder': 'Paste JSON here…',
  'tools.jsonFormat.spaces': 'spaces',
  'tools.jsonFormat.minify': 'Minify',
} as const;

export type MessageKey = keyof typeof en;
