export const TEXT_OPERATIONS = [
  'case',
  'slug',
  'sort',
  'dedupe',
  'whitespace',
  'accents',
  'line-endings',
  'reverse',
  'line-number',
  'wrap',
  'extract-emails',
  'extract-urls',
  'list',
  'stats',
  'frequency',
  'normalize',
  'visualize',
  'replace',
] as const;

export type TextOperation = (typeof TEXT_OPERATIONS)[number];
export const LIST_FORMATS = ['newline', 'comma', 'space', 'semicolon', 'json', 'csv'] as const;
export type ListFormat = (typeof LIST_FORMATS)[number];
export const CASE_FORMATS = [
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'upper',
  'lower',
  'title',
] as const;
export type CaseFormat = (typeof CASE_FORMATS)[number];
export type TextWorkbenchOptions = {
  caseFormat: CaseFormat;
  separator: '-' | '_';
  lowercase: boolean;
  stripAccents: boolean;
  direction: 'asc' | 'desc';
  ignoreCase: boolean;
  numeric: boolean;
  trimLines: boolean;
  removeEmpty: boolean;
  dedupe: boolean;
  collapseSpaces: boolean;
  tabsToSpaces: boolean;
  tabWidth: number;
  removeAll: boolean;
  lineEnding: 'lf' | 'crlf' | 'cr';
  reverseMode: 'graphemes' | 'words' | 'lines';
  start: number;
  numberSeparator: string;
  width: number;
  listFrom: ListFormat;
  listTo: ListFormat;
  normalizeForm: 'NFC' | 'NFD' | 'NFKC' | 'NFKD';
  minimumLength: number;
  find: string;
  replacement: string;
};

export const DEFAULT_TEXT_OPTIONS: TextWorkbenchOptions = {
  caseFormat: 'camel',
  separator: '-',
  lowercase: true,
  stripAccents: true,
  direction: 'asc',
  ignoreCase: false,
  numeric: false,
  trimLines: true,
  removeEmpty: false,
  dedupe: false,
  collapseSpaces: true,
  tabsToSpaces: false,
  tabWidth: 2,
  removeAll: false,
  lineEnding: 'lf',
  reverseMode: 'graphemes',
  start: 1,
  numberSeparator: '. ',
  width: 80,
  listFrom: 'newline',
  listTo: 'json',
  normalizeForm: 'NFC',
  minimumLength: 1,
  find: '',
  replacement: '',
};

export class TextWorkbenchError extends Error {
  constructor(public readonly code: 'integer' | 'listJson' | 'listCsv' | 'unsupported') {
    super(code);
  }
}

export function isTextOperation(value: string | null): value is TextOperation {
  return TEXT_OPERATIONS.some((operation) => operation === value);
}

function integer(value: number, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new TextWorkbenchError('integer');
  }
  return value;
}

function segment(input: string, granularity: 'grapheme' | 'word' | 'sentence') {
  if (typeof Intl.Segmenter !== 'function') throw new TextWorkbenchError('unsupported');
  return [...new Intl.Segmenter(undefined, { granularity }).segment(input)];
}

export function graphemes(input: string): string[] {
  return segment(input, 'grapheme').map((part) => part.segment);
}

function words(input: string): string[] {
  return segment(input, 'word')
    .filter((part) => part.isWordLike)
    .map((part) => part.segment);
}

export function splitTextLines(input: string): string[] {
  return input.split(/\r\n|\r|\n/);
}

export function removeTextAccents(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .normalize('NFC');
}

function namingWords(input: string): string[] {
  return input
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => word.toLocaleLowerCase());
}

function capitalize(input: string): string {
  const [first = '', ...rest] = Array.from(input);
  return first.toLocaleUpperCase() + rest.join('');
}

export function convertTextCase(input: string, format: CaseFormat): string {
  if (format === 'upper') return input.toLocaleUpperCase();
  if (format === 'lower') return input.toLocaleLowerCase();
  if (format === 'title')
    return input.replace(/[\p{L}\p{N}]+/gu, (word) => capitalize(word.toLocaleLowerCase()));
  const tokens = namingWords(input);
  switch (format) {
    case 'camel':
      return tokens.map((word, index) => (index ? capitalize(word) : word)).join('');
    case 'pascal':
      return tokens.map(capitalize).join('');
    case 'snake':
      return tokens.join('_');
    case 'kebab':
      return tokens.join('-');
    case 'constant':
      return tokens.join('_').toLocaleUpperCase();
  }
}

function uniqueLines(lines: string[], ignoreCase: boolean): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = ignoreCase ? line.toLocaleLowerCase() : line;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Greedy word wrapping measures grapheme clusters and never splits an emoji or combining sequence. */
export function wrapTextGraphemes(input: string, width: number): string {
  integer(width, 1, 100_000);
  return splitTextLines(input)
    .flatMap((line) => {
      if (!line.trim()) return [''];
      const output: string[] = [];
      let current: string[] = [];
      for (const word of line.trim().split(/\s+/u)) {
        const units = graphemes(word);
        if (units.length > width) {
          if (current.length) output.push(current.join(''));
          let offset = 0;
          while (units.length - offset > width) {
            output.push(units.slice(offset, offset + width).join(''));
            offset += width;
          }
          current = units.slice(offset);
        } else if (!current.length) current = units;
        else if (current.length + 1 + units.length <= width) current.push(' ', ...units);
        else {
          output.push(current.join(''));
          current = units;
        }
      }
      if (current.length) output.push(current.join(''));
      return output;
    })
    .join('\n');
}

/** Strict CSV list parser: quotes may only open at a field boundary. */
export function parseCsvList(input: string): string[] {
  const fields: string[] = [];
  let cell = '';
  let quoted = false;
  let closed = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += char;
    } else if (char === ',' || char === '\r' || char === '\n') {
      fields.push(cell);
      cell = '';
      closed = false;
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      if (index === input.length - 1 && char !== ',') return fields;
    } else if (char === '"' && cell === '' && !closed) quoted = true;
    else if (char === '"' || closed) throw new TextWorkbenchError('listCsv');
    else cell += char;
  }
  if (quoted) throw new TextWorkbenchError('listCsv');
  fields.push(cell);
  return fields;
}

function parseList(input: string, format: ListFormat): string[] {
  if (format === 'json') {
    let value: unknown;
    try {
      value = JSON.parse(input);
    } catch {
      throw new TextWorkbenchError('listJson');
    }
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new TextWorkbenchError('listJson');
    }
    return value;
  }
  if (format === 'csv') return parseCsvList(input);
  if (format === 'newline') return splitTextLines(input);
  return input.split(format === 'space' ? /\s+/u : format === 'comma' ? ',' : ';');
}

export function formatTextList(input: string, options: TextWorkbenchOptions): string {
  let items = parseList(input, options.listFrom);
  if (options.trimLines) items = items.map((item) => item.trim());
  if (options.removeEmpty) items = items.filter((item) => item !== '');
  if (options.dedupe) items = uniqueLines(items, options.ignoreCase);
  if (options.listTo === 'json') return JSON.stringify(items, null, 2);
  if (options.listTo === 'csv')
    return items
      .map((item) => (/[",\r\n]/.test(item) ? `"${item.replaceAll('"', '""')}"` : item))
      .join(',');
  const separator = { newline: '\n', comma: ', ', space: ' ', semicolon: '; ' }[options.listTo];
  return items.join(separator);
}

export type TextStats = {
  characters: number;
  codePoints: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  bytes: number;
};

export function analyzeText(input: string): TextStats {
  return {
    characters: graphemes(input).length,
    codePoints: Array.from(input).length,
    words: words(input).length,
    lines: input ? splitTextLines(input).length : 0,
    paragraphs: input
      .replace(/\r\n|\r/g, '\n')
      .split(/\n\s*\n/u)
      .filter((part) => part.trim()).length,
    sentences: segment(input, 'sentence').filter((part) => part.segment.trim()).length,
    bytes: new TextEncoder().encode(input).length,
  };
}

export function textWordFrequency(input: string, minimumLength: number): [string, number][] {
  integer(minimumLength, 1, 100_000);
  const counts = new Map<string, number>();
  for (const word of words(input.toLocaleLowerCase())) {
    if (graphemes(word).length >= minimumLength) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

export function transformText(
  input: string,
  operation: TextOperation,
  options: TextWorkbenchOptions,
  label: (key: string) => string = (key) => key
): string {
  switch (operation) {
    case 'case':
      return convertTextCase(input, options.caseFormat);
    case 'slug': {
      let output = options.stripAccents ? removeTextAccents(input) : input;
      if (options.lowercase) output = output.toLocaleLowerCase();
      return output.replace(/[^a-zA-Z0-9]+/g, options.separator).replace(/^[-_]+|[-_]+$/g, '');
    }
    case 'sort':
    case 'dedupe': {
      let lines = splitTextLines(input);
      if (options.trimLines) lines = lines.map((line) => line.trim());
      if (options.removeEmpty) lines = lines.filter((line) => line.trim() !== '');
      if (operation === 'dedupe' || options.dedupe) lines = uniqueLines(lines, options.ignoreCase);
      if (operation === 'sort') {
        const compare = new Intl.Collator(undefined, {
          numeric: options.numeric,
          sensitivity: options.ignoreCase ? 'accent' : 'variant',
        }).compare;
        lines.sort((left, right) =>
          options.direction === 'asc' ? compare(left, right) : compare(right, left)
        );
      }
      return lines.join('\n');
    }
    case 'whitespace': {
      if (options.removeAll) return input.replace(/\s+/gu, '');
      const tabWidth = integer(options.tabWidth, 1, 32);
      let lines = splitTextLines(input);
      if (options.tabsToSpaces)
        lines = lines.map((line) => line.replaceAll('\t', ' '.repeat(tabWidth)));
      if (options.trimLines) lines = lines.map((line) => line.trim());
      if (options.collapseSpaces) lines = lines.map((line) => line.replace(/ {2,}/g, ' '));
      if (options.removeEmpty) lines = lines.filter((line) => line.trim() !== '');
      return lines.join('\n');
    }
    case 'accents':
      return removeTextAccents(input);
    case 'replace': {
      if (!options.find) return input;
      const escaped = options.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return input.replace(
        new RegExp(escaped, options.ignoreCase ? 'giu' : 'gu'),
        () => options.replacement
      );
    }
    case 'line-endings':
      return input.replace(/\r\n|\r|\n/g, { lf: '\n', crlf: '\r\n', cr: '\r' }[options.lineEnding]);
    case 'reverse':
      return options.reverseMode === 'graphemes'
        ? graphemes(input).reverse().join('')
        : options.reverseMode === 'lines'
          ? splitTextLines(input).reverse().join('\n')
          : input.trim().split(/\s+/u).reverse().join(' ');
    case 'line-number': {
      const start = integer(options.start, -1_000_000, 1_000_000);
      const lines = splitTextLines(input);
      const width = Math.max(String(start).length, String(start + lines.length - 1).length);
      return lines
        .map(
          (line, index) =>
            `${String(start + index).padStart(width)}${options.numberSeparator}${line}`
        )
        .join('\n');
    }
    case 'wrap':
      return wrapTextGraphemes(input, options.width);
    case 'extract-emails':
      return [...new Set(input.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [])].join(
        '\n'
      );
    case 'extract-urls':
      return [
        ...new Set(
          (input.match(/https?:\/\/[^\s<>"'[\]]+/gi) ?? []).map((url) => {
            let clean = url.replace(/[.,;!?]+$/g, '');
            while (
              clean.endsWith(')') &&
              (clean.match(/\(/g)?.length ?? 0) < (clean.match(/\)/g)?.length ?? 0)
            )
              clean = clean.slice(0, -1);
            return clean;
          })
        ),
      ].join('\n');
    case 'list':
      return formatTextList(input, options);
    case 'stats':
      return Object.entries(analyzeText(input))
        .map(([key, value]) => `${label(key)}: ${value}`)
        .join('\n');
    case 'frequency': {
      const rows = textWordFrequency(input, options.minimumLength);
      return `${label('unique')}: ${rows.length}\n${rows.map(([word, count]) => `${count}\t${word}`).join('\n')}`;
    }
    case 'normalize':
      return input.normalize(options.normalizeForm);
    case 'visualize':
      return input
        .replaceAll(' ', '·')
        .replaceAll('\t', '→\t')
        .replace(
          /\r\n|\r|\n/g,
          (ending) => `${ending === '\r\n' ? '␍␊' : ending === '\r' ? '␍' : '␊'}\n`
        );
  }
}
