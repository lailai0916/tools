import { dump as dumpYaml } from 'js-yaml';
import type { UtilityDefinition, UtilityValues } from '@/components/UtilityWorkbench';
import { UtilityInputError } from '@/utils/UtilityInputError';

type Text = (suffix: string) => string;

function required(values: UtilityValues, key: string): string {
  const value = values[key]?.trim();
  if (!value) throw new UtilityInputError('required');
  return value;
}

function numeric(values: UtilityValues, key: string): number {
  const value = Number(required(values, key));
  if (!Number.isFinite(value)) throw new UtilityInputError('number');
  return value;
}

function parseDelimited(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (quoted) throw new UtilityInputError('csv');
  row.push(cell);
  if (row.length > 1 || row[0] !== '' || rows.length === 0) rows.push(row);
  return rows;
}

function encodeDelimitedCell(value: string, delimiter: string): string {
  return value.includes(delimiter) || /["\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;
}

function formatXml(input: string): string {
  const documentNode = new DOMParser().parseFromString(input, 'application/xml');
  if (documentNode.querySelector('parsererror')) throw new UtilityInputError('xml');
  const serializer = new XMLSerializer();
  const serialize = (node: Node, depth: number): string => {
    const indent = '  '.repeat(depth);
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return `${indent}${serializer.serializeToString(node).trim()}`;
    }
    const element = node as Element;
    const children = [...element.childNodes];
    const shallow = serializer.serializeToString(element.cloneNode(false));
    if (children.length === 0) return `${indent}${shallow}`;
    const opening = shallow.replace(/\s*\/>$/, '>');
    const closing = `</${element.tagName}>`;
    const inline = children.every(
      (child) => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE
    );
    if (inline) {
      return `${indent}${opening}${children.map((child) => serializer.serializeToString(child)).join('')}${closing}`;
    }
    const body = children
      .filter((child) => child.nodeType !== Node.TEXT_NODE || child.textContent?.trim())
      .map((child) => serialize(child, depth + 1))
      .join('\n');
    return `${indent}${opening}\n${body}\n${indent}${closing}`;
  };
  return [...documentNode.childNodes].map((node) => serialize(node, 0)).join('\n');
}

function flattenJson(value: unknown, prefix = '', result: Record<string, unknown> = {}) {
  if (Array.isArray(value)) {
    if (value.length === 0) result[prefix || '$'] = [];
    value.forEach((item, index) => flattenJson(item, `${prefix}[${index}]`, result));
  } else if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) result[prefix || '$'] = {};
    for (const [key, child] of entries) {
      flattenJson(child, prefix ? `${prefix}.${key}` : key, result);
    }
  } else {
    result[prefix || '$'] = value;
  }
  return result;
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJson(child)])
    );
  }
  return value;
}

function hexToText(input: string): string {
  const clean = input.replace(/(?:0x|\s|[:-])/gi, '');
  if (!/^[0-9a-f]*$/i.test(clean) || clean.length % 2 !== 0) throw new UtilityInputError('hex');
  const bytes = Uint8Array.from(
    clean.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []
  );
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function base58Encode(input: string): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = new TextEncoder().encode(input);
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  let output = '';
  while (value > 0n) {
    output = alphabet[Number(value % 58n)] + output;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    output = '1' + output;
  }
  return output;
}

function base58Decode(input: string): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = 0n;
  for (const character of input.trim()) {
    const digit = alphabet.indexOf(character);
    if (digit < 0) throw new UtilityInputError('base58');
    value = value * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (value > 0n) {
    bytes.unshift(Number(value % 256n));
    value /= 256n;
  }
  for (const character of input.trim()) {
    if (character !== '1') break;
    bytes.unshift(0);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
}

function simpleMarkdown(input: string): string {
  const escape = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const inline = (value: string) =>
    escape(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  let inList = false;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      if (!inList) output.push('<ul>');
      inList = true;
      output.push(`  <li>${inline(item[1])}</li>`);
      continue;
    }
    if (inList) {
      output.push('</ul>');
      inList = false;
    }
    if (heading)
      output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    else if (/^>\s?/.test(line))
      output.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`);
    else if (line.trim()) output.push(`<p>${inline(line)}</p>`);
  }
  if (inList) output.push('</ul>');
  return output.join('\n');
}

function wrapText(input: string, width: number): string {
  if (!Number.isInteger(width) || width < 1) throw new UtilityInputError('width');
  return input
    .split(/\r?\n/)
    .flatMap((line) => {
      if (!line) return [''];
      const result: string[] = [];
      let current = '';
      for (const word of line.split(/\s+/)) {
        if (word.length > width) {
          if (current) result.push(current);
          for (let index = 0; index < word.length; index += width)
            result.push(word.slice(index, index + width));
          current = '';
        } else if (!current) current = word;
        else if (current.length + word.length + 1 <= width) current += ` ${word}`;
        else {
          result.push(current);
          current = word;
        }
      }
      if (current) result.push(current);
      return result;
    })
    .join('\n');
}

const converterDefinitions: Record<string, UtilityDefinition> = {
  csvToTsv: {
    stem: 'csvToTsv',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) =>
      parseDelimited(input, ',')
        .map((row) => row.map((cell) => encodeDelimitedCell(cell, '\t')).join('\t'))
        .join('\n'),
  },
  xmlFormatter: {
    stem: 'xmlFormatter',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => formatXml(input),
  },
  jsonFlatten: {
    stem: 'jsonFlatten',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => JSON.stringify(flattenJson(JSON.parse(input)), null, 2),
  },
  jsonSortKeys: {
    stem: 'jsonSortKeys',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => JSON.stringify(sortJson(JSON.parse(input)), null, 2),
  },
  hexText: {
    stem: 'hexText',
    fields: [
      { key: 'direction', type: 'select', defaultValue: 'encode', options: ['encode', 'decode'] },
      { key: 'input', type: 'textarea' },
    ],
    compute: ({ direction, input }) =>
      direction === 'encode'
        ? [...new TextEncoder().encode(input)]
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join(' ')
        : hexToText(input),
  },
  listConverter: {
    stem: 'listConverter',
    fields: [
      {
        key: 'from',
        type: 'select',
        defaultValue: 'newline',
        options: ['newline', 'comma', 'space', 'semicolon'],
      },
      {
        key: 'to',
        type: 'select',
        defaultValue: 'comma',
        options: ['newline', 'comma', 'space', 'semicolon'],
      },
      { key: 'input', type: 'textarea' },
    ],
    compute: ({ from, to, input }) => {
      const delimiters: Record<string, RegExp | string> = {
        newline: /\r?\n/,
        comma: ',',
        space: /\s+/,
        semicolon: ';',
      };
      const joins: Record<string, string> = {
        newline: '\n',
        comma: ', ',
        space: ' ',
        semicolon: '; ',
      };
      return input
        .split(delimiters[from])
        .map((item) => item.trim())
        .filter(Boolean)
        .join(joins[to]);
    },
  },
  markdownToHtml: {
    stem: 'markdownToHtml',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => simpleMarkdown(input),
  },
  base58: {
    stem: 'base58',
    fields: [
      { key: 'direction', type: 'select', defaultValue: 'encode', options: ['encode', 'decode'] },
      { key: 'input', type: 'textarea' },
    ],
    compute: ({ direction, input }) =>
      direction === 'encode' ? base58Encode(input) : base58Decode(input),
  },
  lengthConverter: {
    stem: 'lengthConverter',
    fields: [
      { key: 'value', type: 'number', defaultValue: '1', step: 'any' },
      {
        key: 'from',
        type: 'select',
        defaultValue: 'meter',
        options: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
      },
      {
        key: 'to',
        type: 'select',
        defaultValue: 'foot',
        options: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
      },
    ],
    compute: (values) => {
      const factors: Record<string, number> = {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254,
      };
      return String((numeric(values, 'value') * factors[values.from]) / factors[values.to]);
    },
  },
};

const textDefinitions: Record<string, UtilityDefinition> = {
  duplicateLines: {
    stem: 'duplicateLines',
    fields: [
      {
        key: 'mode',
        type: 'select',
        defaultValue: 'exact',
        options: ['exact', 'trim', 'ignoreCase'],
      },
      { key: 'input', type: 'textarea' },
    ],
    compute: ({ mode, input }) => {
      const seen = new Set<string>();
      return input
        .split(/\r?\n/)
        .filter((line) => {
          const key =
            mode === 'exact'
              ? line
              : mode === 'trim'
                ? line.trim()
                : line.trim().toLocaleLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .join('\n');
    },
  },
  wordFrequency: {
    stem: 'wordFrequency',
    fields: [
      { key: 'minimumLength', type: 'number', defaultValue: '1', min: '1', step: '1' },
      { key: 'input', type: 'textarea' },
    ],
    compute: (values, text) => {
      const minimum = Math.max(1, Math.floor(numeric(values, 'minimumLength')));
      const words =
        values.input.toLocaleLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
      const counts = new Map<string, number>();
      words
        .filter((word) => [...word].length >= minimum)
        .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
      const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      return `${text('unique')}: ${rows.length}\n${rows.map(([word, count]) => `${count.toString().padStart(5)}  ${word}`).join('\n')}`;
    },
  },
  lineNumberer: {
    stem: 'lineNumberer',
    fields: [
      { key: 'start', type: 'number', defaultValue: '1', step: '1' },
      { key: 'separator', type: 'text', defaultValue: '. ' },
      { key: 'input', type: 'textarea' },
    ],
    compute: (values) => {
      const start = Math.trunc(numeric(values, 'start'));
      const lines = values.input.split(/\r?\n/);
      const width = String(start + lines.length - 1).length;
      return lines
        .map((line, index) => `${String(start + index).padStart(width)}${values.separator}${line}`)
        .join('\n');
    },
  },
  textWrap: {
    stem: 'textWrap',
    fields: [
      { key: 'width', type: 'number', defaultValue: '80', min: '1', step: '1' },
      { key: 'input', type: 'textarea' },
    ],
    compute: (values) => wrapText(values.input, Math.trunc(numeric(values, 'width'))),
  },
  extractEmails: {
    stem: 'extractEmails',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) =>
      [...new Set(input.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [])].join('\n'),
  },
  extractUrls: {
    stem: 'extractUrls',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => [...new Set(input.match(/https?:\/\/[^\s<>"')\]]+/g) ?? [])].join('\n'),
  },
  unicodeNormalizer: {
    stem: 'unicodeNormalizer',
    fields: [
      { key: 'form', type: 'select', defaultValue: 'NFC', options: ['NFC', 'NFD', 'NFKC', 'NFKD'] },
      { key: 'input', type: 'textarea' },
    ],
    compute: ({ form, input }) => input.normalize(form as 'NFC' | 'NFD' | 'NFKC' | 'NFKD'),
  },
  whitespaceVisualizer: {
    stem: 'whitespaceVisualizer',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) =>
      input.replaceAll(' ', '·').replaceAll('\t', '→\t').replace(/\r?\n/g, '↵\n'),
  },
};

function md5(input: string): string {
  const bytes = [...new TextEncoder().encode(input)];
  const bitLength = BigInt(bytes.length) * 8n;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let index = 0; index < 8; index += 1) {
    bytes.push(Number((bitLength >> BigInt(index * 8)) & 0xffn));
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const constants = Array.from(
    { length: 64 },
    (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0
  );
  const rotate = (value: number, amount: number) =>
    ((value << amount) | (value >>> (32 - amount))) >>> 0;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 16 }, (_, index) => {
      const start = offset + index * 4;
      return (
        (bytes[start] |
          (bytes[start + 1] << 8) |
          (bytes[start + 2] << 16) |
          (bytes[start + 3] << 24)) >>>
        0
      );
    });
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let index = 0; index < 64; index += 1) {
      let f: number;
      let wordIndex: number;
      if (index < 16) {
        f = (b & c) | (~b & d);
        wordIndex = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        wordIndex = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        wordIndex = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        wordIndex = (7 * index) % 16;
      }
      const nextD = d;
      d = c;
      c = b;
      b = (b + rotate((a + f + constants[index] + words[wordIndex]) >>> 0, shifts[index])) >>> 0;
      a = nextD;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return [a0, b0, c0, d0]
    .flatMap((word) =>
      [0, 8, 16, 24].map((shift) => ((word >>> shift) & 0xff).toString(16).padStart(2, '0'))
    )
    .join('');
}

function inspectUuid(input: string, text: Text): string {
  const value = input
    .trim()
    .toLowerCase()
    .replace(/^urn:uuid:/, '')
    .replace(/[{}]/g, '');
  const match =
    /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([89ab0-9a-f][0-9a-f]{3})-([0-9a-f]{12})$/.exec(
      value
    );
  if (!match) throw new UtilityInputError('uuid');
  const version = Number.parseInt(match[3][0], 16);
  const variantNibble = Number.parseInt(match[4][0], 16);
  const variant =
    (variantNibble & 8) === 0
      ? 'NCS'
      : (variantNibble & 12) === 8
        ? 'RFC 4122'
        : (variantNibble & 14) === 12
          ? 'Microsoft'
          : 'Future';
  const rows = [
    `${text('canonical')}: ${value}`,
    `${text('version')}: ${version}`,
    `${text('variant')}: ${variant}`,
  ];
  if (version === 7) {
    const milliseconds = Number.parseInt(match[1] + match[2], 16);
    rows.push(`${text('timestamp')}: ${new Date(milliseconds).toISOString()}`);
  } else if (version === 1) {
    const timestamp = BigInt(`0x${match[3].slice(1)}${match[2]}${match[1]}`);
    const unixMilliseconds = Number((timestamp - 0x01b21dd213814000n) / 10000n);
    rows.push(`${text('timestamp')}: ${new Date(unixMilliseconds).toISOString()}`);
  }
  return rows.join('\n');
}

const cryptoDefinitions: Record<string, UtilityDefinition> = {
  md5Hash: {
    stem: 'md5Hash',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => md5(input),
  },
  uuidInspector: {
    stem: 'uuidInspector',
    fields: [{ key: 'input', type: 'text' }],
    compute: ({ input }, text) => inspectUuid(input, text),
    outputRows: true,
  },
};

function parseIpv4(input: string): number {
  const parts = input.trim().split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    throw new UtilityInputError('ipv4');
  }
  return parts.reduce((value, part) => ((value << 8) | Number(part)) >>> 0, 0);
}

function formatIpv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

function subnet(values: UtilityValues, text: Text): string {
  const address = parseIpv4(required(values, 'address'));
  const prefix = Math.trunc(numeric(values, 'prefix'));
  if (prefix < 0 || prefix > 32) throw new UtilityInputError('prefix');
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (address & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const total = 2 ** (32 - prefix);
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return [
    `${text('network')}: ${formatIpv4(network)}/${prefix}`,
    `${text('mask')}: ${formatIpv4(mask)}`,
    `${text('broadcast')}: ${formatIpv4(broadcast)}`,
    `${text('range')}: ${formatIpv4(first)} – ${formatIpv4(last)}`,
    `${text('addresses')}: ${total.toLocaleString('en-US')}`,
  ].join('\n');
}

function parseCookie(input: string): string {
  const result: Record<string, string> = {};
  for (const part of input.split(';')) {
    const index = part.indexOf('=');
    if (index < 1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return JSON.stringify(result, null, 2);
}

function parseHeaders(input: string): string {
  const result: Record<string, string | string[]> = {};
  for (const line of input.split(/\r?\n/)) {
    if (!line.trim() || /^HTTP\/\d/.test(line)) continue;
    const index = line.indexOf(':');
    if (index < 1) throw new UtilityInputError('header');
    const name = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    const previous = result[name];
    result[name] =
      previous === undefined
        ? value
        : Array.isArray(previous)
          ? [...previous, value]
          : [previous, value];
  }
  return JSON.stringify(result, null, 2);
}

function buildUtm(values: UtilityValues): string {
  const url = new URL(required(values, 'url'));
  const parameters: Record<string, string> = {
    utm_source: required(values, 'source'),
    utm_medium: required(values, 'medium'),
    utm_campaign: required(values, 'campaign'),
    utm_term: values.term.trim(),
    utm_content: values.content.trim(),
  };
  for (const [key, value] of Object.entries(parameters)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function buildRobots(values: UtilityValues): string {
  const lines = [`User-agent: ${values.userAgent.trim() || '*'}`];
  for (const path of values.allow
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean))
    lines.push(`Allow: ${path}`);
  for (const path of values.disallow
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean))
    lines.push(`Disallow: ${path}`);
  if (values.sitemap.trim())
    lines.push('', `Sitemap: ${new URL(values.sitemap.trim()).toString()}`);
  return lines.join('\n');
}

function buildSitemap(values: UtilityValues): string {
  const base = new URL(required(values, 'baseUrl'));
  const urls = values.paths
    .split(/\r?\n/)
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path) => new URL(path, base).toString());
  if (urls.length === 0) throw new UtilityInputError('paths');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</loc></url>`).join('\n')}\n</urlset>`;
}

function joinUrls(values: UtilityValues): string {
  const base = new URL(required(values, 'baseUrl'));
  return values.paths
    .split(/\r?\n/)
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path) => new URL(path, base).toString())
    .join('\n');
}

function buildMailto(values: UtilityValues): string {
  const recipients = required(values, 'to')
    .split(/[;,\s]+/)
    .filter(Boolean)
    .join(',');
  const parameters = new URLSearchParams();
  if (values.cc.trim()) parameters.set('cc', values.cc.trim());
  if (values.bcc.trim()) parameters.set('bcc', values.bcc.trim());
  if (values.subject.trim()) parameters.set('subject', values.subject);
  if (values.body.trim()) parameters.set('body', values.body);
  const query = parameters.toString();
  return `mailto:${recipients}${query ? `?${query}` : ''}`;
}

const webDefinitions: Record<string, UtilityDefinition> = {
  ipv4Subnet: {
    stem: 'ipv4Subnet',
    fields: [
      { key: 'address', type: 'text', defaultValue: '192.168.1.10' },
      { key: 'prefix', type: 'number', defaultValue: '24', min: '0', max: '32', step: '1' },
    ],
    compute: subnet,
    outputRows: true,
  },
  cookieParser: {
    stem: 'cookieParser',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => parseCookie(input),
  },
  httpHeadersParser: {
    stem: 'httpHeadersParser',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => parseHeaders(input),
  },
  utmBuilder: {
    stem: 'utmBuilder',
    fields: [
      { key: 'url', type: 'text' },
      { key: 'source', type: 'text' },
      { key: 'medium', type: 'text' },
      { key: 'campaign', type: 'text' },
      { key: 'term', type: 'text' },
      { key: 'content', type: 'text' },
    ],
    compute: buildUtm,
  },
  robotsGenerator: {
    stem: 'robotsGenerator',
    fields: [
      { key: 'userAgent', type: 'text', defaultValue: '*' },
      { key: 'sitemap', type: 'text' },
      { key: 'allow', type: 'textarea', defaultValue: '/' },
      { key: 'disallow', type: 'textarea', defaultValue: '/admin' },
    ],
    compute: buildRobots,
  },
  sitemapGenerator: {
    stem: 'sitemapGenerator',
    fields: [
      { key: 'baseUrl', type: 'text', defaultValue: 'https://example.com/' },
      { key: 'paths', type: 'textarea', defaultValue: '/\n/about\n/contact' },
    ],
    compute: buildSitemap,
  },
  urlJoiner: {
    stem: 'urlJoiner',
    fields: [
      { key: 'baseUrl', type: 'text', defaultValue: 'https://example.com/docs/' },
      { key: 'paths', type: 'textarea' },
    ],
    compute: joinUrls,
  },
  mailtoGenerator: {
    stem: 'mailtoGenerator',
    fields: [
      { key: 'to', type: 'text' },
      { key: 'cc', type: 'text' },
      { key: 'bcc', type: 'text' },
      { key: 'subject', type: 'text' },
      { key: 'body', type: 'textarea' },
    ],
    compute: buildMailto,
  },
};

function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    const schemas = value.map(inferSchema);
    const unique = [...new Map(schemas.map((schema) => [JSON.stringify(schema), schema])).values()];
    return {
      type: 'array',
      ...(unique.length ? { items: unique.length === 1 ? unique[0] : { anyOf: unique } } : {}),
    };
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    return {
      type: 'object',
      properties: Object.fromEntries(entries.map(([key, child]) => [key, inferSchema(child)])),
      required: entries.map(([key]) => key),
      additionalProperties: false,
    };
  }
  return { type: typeof value === 'number' && Number.isInteger(value) ? 'integer' : typeof value };
}

function formatSql(input: string): string {
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'ORDER BY',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'UNION ALL',
    'UNION',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'FULL JOIN',
    'JOIN',
    'ON',
    'VALUES',
    'SET',
    'RETURNING',
  ];
  let output = input.replace(/\s+/g, ' ').trim();
  for (const keyword of keywords) {
    const pattern = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'gi');
    output = output.replace(pattern, `\n${keyword}`);
  }
  output = output.replace(
    /\b(INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi,
    (match) => `\n${match.toUpperCase()}`
  );
  output = output.replace(/,\s*/g, ',\n  ').replace(/^\n/, '');
  return output;
}

function minifyCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyHtml(input: string): string {
  const protectedBlocks: string[] = [];
  const protectedInput = input.replace(
    /<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,
    (block) => {
      protectedBlocks.push(block);
      return `___PROTECTED_BLOCK_${protectedBlocks.length - 1}___`;
    }
  );
  return protectedInput
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/___PROTECTED_BLOCK_(\d+)___/g, (_, index: string) => protectedBlocks[Number(index)]);
}

function shellTokens(input: string): string[] {
  const tokens: string[] = [];
  let token = '';
  let quote = '';
  let escaped = false;
  for (const character of input.replace(/\\\r?\n/g, ' ')) {
    if (escaped) {
      token += character;
      escaped = false;
    } else if (character === '\\' && quote !== "'") escaped = true;
    else if (quote) {
      if (character === quote) quote = '';
      else token += character;
    } else if (character === '"' || character === "'") quote = character;
    else if (/\s/.test(character)) {
      if (token) tokens.push(token);
      token = '';
    } else token += character;
  }
  if (quote) throw new UtilityInputError('shellQuote');
  if (token) tokens.push(token);
  return tokens;
}

function dockerRunToCompose(input: string): string {
  const tokens = shellTokens(input);
  if (tokens[0] === 'docker') tokens.shift();
  if (tokens[0] === 'run') tokens.shift();
  const service: Record<string, unknown> = {};
  const ports: string[] = [];
  const environment: string[] = [];
  const volumes: string[] = [];
  const command: string[] = [];
  let image = '';

  const take = (index: number) => {
    if (!tokens[index + 1]) throw new UtilityInputError('dockerValue');
    return tokens[index + 1];
  };
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '-d' || token === '--detach' || token === '--rm') continue;
    if (token === '-p' || token === '--publish') {
      ports.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--publish=')) {
      ports.push(token.slice(10));
      continue;
    }
    if (token === '-e' || token === '--env') {
      environment.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--env=')) {
      environment.push(token.slice(6));
      continue;
    }
    if (token === '-v' || token === '--volume') {
      volumes.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--volume=')) {
      volumes.push(token.slice(9));
      continue;
    }
    if (token === '--name') {
      service.container_name = take(index);
      index += 1;
      continue;
    }
    if (token.startsWith('--name=')) {
      service.container_name = token.slice(7);
      continue;
    }
    if (token === '--restart') {
      service.restart = take(index);
      index += 1;
      continue;
    }
    if (token.startsWith('--restart=')) {
      service.restart = token.slice(10);
      continue;
    }
    if (token.startsWith('-') && !image) throw new UtilityInputError('dockerOption');
    if (!image) image = token;
    else command.push(token);
  }
  if (!image) throw new UtilityInputError('dockerImage');
  service.image = image;
  if (ports.length) service.ports = ports;
  if (environment.length) service.environment = environment;
  if (volumes.length) service.volumes = volumes;
  if (command.length) service.command = command;
  const name = String(
    service.container_name ?? image.split('/').pop()?.split(':')[0] ?? 'app'
  ).replace(/[^a-zA-Z0-9_-]/g, '-');
  return dumpYaml({ services: { [name]: service } }, { noRefs: true, lineWidth: 100 });
}

const gitignoreTemplates: Record<string, string[]> = {
  node: ['node_modules/', 'dist/', 'coverage/', '.env', '.env.*', '!.env.example', '*.log'],
  python: [
    '__pycache__/',
    '*.py[cod]',
    '.venv/',
    'venv/',
    '.pytest_cache/',
    '.mypy_cache/',
    'dist/',
    '*.egg-info/',
  ],
  go: ['bin/', '*.test', '*.out', 'vendor/'],
  rust: ['target/', '**/*.rs.bk'],
  macos: ['.DS_Store', '.AppleDouble', '.LSOverride'],
  vscode: ['.vscode/*', '!.vscode/extensions.json', '!.vscode/settings.json'],
  jetbrains: ['.idea/', '*.iml'],
};

function buildGitignore(values: UtilityValues): string {
  const stacks = required(values, 'stacks')
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean);
  const sections: string[] = [];
  for (const stack of stacks) {
    const entries = gitignoreTemplates[stack];
    if (!entries) throw new UtilityInputError('template');
    sections.push(`# ${stack}\n${entries.join('\n')}`);
  }
  if (values.extra.trim()) sections.push(`# custom\n${values.extra.trim()}`);
  return sections.join('\n\n') + '\n';
}

function parseSemver(value: string): { core: number[]; prerelease: string[] } {
  const match =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(
      value.trim()
    );
  if (!match) throw new UtilityInputError('semver');
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4]?.split('.') ?? [],
  };
}

function compareSemver(leftValue: string, rightValue: string): number {
  const left = parseSemver(leftValue);
  const right = parseSemver(rightValue);
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index])
      return left.core[index] < right.core[index] ? -1 : 1;
  }
  if (!left.prerelease.length || !right.prerelease.length) {
    return left.prerelease.length === right.prerelease.length ? 0 : left.prerelease.length ? -1 : 1;
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1;
    if (right.prerelease[index] === undefined) return 1;
    const a = left.prerelease[index];
    const b = right.prerelease[index];
    if (a === b) continue;
    const aNumber = /^\d+$/.test(a);
    const bNumber = /^\d+$/.test(b);
    if (aNumber && bNumber) return Number(a) < Number(b) ? -1 : 1;
    if (aNumber !== bNumber) return aNumber ? -1 : 1;
    return a < b ? -1 : 1;
  }
  return 0;
}

function cssSpecificity(input: string): string {
  return input
    .split(',')
    .map((raw) => {
      const selector = raw.trim();
      if (!selector) return '';
      const withoutWhere = selector.replace(/:where\([^)]*\)/g, '');
      const ids = withoutWhere.match(/#[\w-]+/g)?.length ?? 0;
      const classes =
        withoutWhere.match(/\.[\w-]+|\[[^\]]+]|:(?!:)[\w-]+(?:\([^)]*\))?/g)?.length ?? 0;
      const pseudoElements = withoutWhere.match(/::[\w-]+/g)?.length ?? 0;
      const elements =
        withoutWhere
          .replace(/#[\w-]+|\.[\w-]+|\[[^\]]+]|::?[\w-]+(?:\([^)]*\))?|\*/g, ' ')
          .split(/[\s>+~(),]+/)
          .filter((part) => /^(?:[a-zA-Z][\w-]*)(?:\|[a-zA-Z][\w-]*)?$/.test(part)).length +
        pseudoElements;
      return `${ids},${classes},${elements}  ${selector}`;
    })
    .filter(Boolean)
    .join('\n');
}

const developmentDefinitions: Record<string, UtilityDefinition> = {
  jsonSchemaGenerator: {
    stem: 'jsonSchemaGenerator',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) =>
      JSON.stringify(
        {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          ...inferSchema(JSON.parse(input)),
        },
        null,
        2
      ),
  },
  sqlFormatter: {
    stem: 'sqlFormatter',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => formatSql(input),
  },
  cssMinifier: {
    stem: 'cssMinifier',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => minifyCss(input),
  },
  htmlMinifier: {
    stem: 'htmlMinifier',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => minifyHtml(input),
  },
  dockerRunToCompose: {
    stem: 'dockerRunToCompose',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => dockerRunToCompose(input),
  },
  gitignoreGenerator: {
    stem: 'gitignoreGenerator',
    fields: [
      { key: 'stacks', type: 'text', defaultValue: 'node, macos, vscode' },
      { key: 'extra', type: 'textarea' },
    ],
    compute: buildGitignore,
  },
  semverCompare: {
    stem: 'semverCompare',
    fields: [
      { key: 'left', type: 'text', defaultValue: '1.0.0' },
      { key: 'right', type: 'text', defaultValue: '2.0.0' },
    ],
    compute: ({ left, right }, text) => {
      const result = compareSemver(left, right);
      return result === 0
        ? text('equal')
        : result < 0
          ? `${left} ${text('olderThan')} ${right}`
          : `${left} ${text('newerThan')} ${right}`;
    },
    outputRows: true,
  },
  cssSpecificity: {
    stem: 'cssSpecificity',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => cssSpecificity(input),
    outputRows: true,
  },
};

type Fraction = { numerator: bigint; denominator: bigint };

function bigintGcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b) [a, b] = [b, a % b];
  return a;
}

function parseFraction(value: string): Fraction {
  const match = /^\s*([+-]?\d+)(?:\s*\/\s*([+-]?\d+))?\s*$/.exec(value);
  if (!match) throw new UtilityInputError('fraction');
  let numerator = BigInt(match[1]);
  let denominator = BigInt(match[2] ?? '1');
  if (denominator === 0n) throw new UtilityInputError('denominator');
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = bigintGcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function calculateFraction(values: UtilityValues): string {
  const left = parseFraction(values.left);
  const right = parseFraction(values.right);
  let numerator: bigint;
  let denominator: bigint;
  if (values.operator === 'add') {
    numerator = left.numerator * right.denominator + right.numerator * left.denominator;
    denominator = left.denominator * right.denominator;
  } else if (values.operator === 'subtract') {
    numerator = left.numerator * right.denominator - right.numerator * left.denominator;
    denominator = left.denominator * right.denominator;
  } else if (values.operator === 'multiply') {
    numerator = left.numerator * right.numerator;
    denominator = left.denominator * right.denominator;
  } else {
    if (right.numerator === 0n) throw new UtilityInputError('divideZero');
    numerator = left.numerator * right.denominator;
    denominator = left.denominator * right.numerator;
  }
  return `${parseFraction(`${numerator}/${denominator}`).numerator}/${parseFraction(`${numerator}/${denominator}`).denominator}`.replace(
    /\/1$/,
    ''
  );
}

function quadratic(values: UtilityValues, text: Text): string {
  const a = numeric(values, 'a');
  const b = numeric(values, 'b');
  const c = numeric(values, 'c');
  if (a === 0) {
    if (b === 0) throw new UtilityInputError('coefficient');
    return `${text('linearRoot')}: ${-c / b}`;
  }
  const discriminant = b * b - 4 * a * c;
  const rows = [`${text('discriminant')}: ${discriminant}`];
  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    rows.push(`x₁ = ${(-b + root) / (2 * a)}`, `x₂ = ${(-b - root) / (2 * a)}`);
  } else if (discriminant === 0) rows.push(`x = ${-b / (2 * a)}`);
  else {
    const real = -b / (2 * a);
    const imaginary = Math.sqrt(-discriminant) / Math.abs(2 * a);
    rows.push(`x₁ = ${real} + ${imaginary}i`, `x₂ = ${real} - ${imaginary}i`);
  }
  return rows.join('\n');
}

function utcDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new UtilityInputError('date');
  const [year, month, day] = value.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  if (
    result.getUTCFullYear() !== year ||
    result.getUTCMonth() !== month - 1 ||
    result.getUTCDate() !== day
  ) {
    throw new UtilityInputError('date');
  }
  return result;
}

function calendarDifference(startValue: string, endValue: string) {
  let start = utcDate(startValue);
  let end = utcDate(endValue);
  let sign = 1;
  if (start > end) {
    [start, end] = [end, start];
    sign = -1;
  }
  const addMonthsClamped = (date: Date, months: number) => {
    const targetMonth = date.getUTCMonth() + months;
    const year = date.getUTCFullYear() + Math.floor(targetMonth / 12);
    const month = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
  };
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let cursor = addMonthsClamped(start, years * 12);
  if (cursor > end) {
    years -= 1;
    cursor = addMonthsClamped(start, years * 12);
  }
  let months =
    (end.getUTCFullYear() - cursor.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    cursor.getUTCMonth();
  let monthCursor = addMonthsClamped(cursor, months);
  if (monthCursor > end) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }
  const days = Math.round((end.getTime() - monthCursor.getTime()) / 86_400_000);
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) * sign;
  return { years, months, days, totalDays, sign };
}

function dateDifference(values: UtilityValues, text: Text): string {
  const difference = calendarDifference(required(values, 'start'), required(values, 'end'));
  const prefix = difference.sign < 0 ? '−' : '';
  return `${text('calendar')}: ${prefix}${difference.years} ${text('years')}, ${difference.months} ${text('months')}, ${difference.days} ${text('days')}\n${text('totalDays')}: ${difference.totalDays}`;
}

function age(values: UtilityValues, text: Text): string {
  if (!values.birthDate) return '';
  const birth = required(values, 'birthDate');
  const asOf = required(values, 'asOf');
  if (utcDate(birth) > utcDate(asOf)) throw new UtilityInputError('birthOrder');
  const difference = calendarDifference(birth, asOf);
  return `${difference.years} ${text('years')}, ${difference.months} ${text('months')}, ${difference.days} ${text('days')}`;
}

function businessDays(values: UtilityValues, text: Text): string {
  let start = utcDate(required(values, 'start'));
  let end = utcDate(required(values, 'end'));
  if (start > end) [start, end] = [end, start];
  const holidays = new Set(
    values.holidays
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => utcDate(value).toISOString().slice(0, 10))
  );
  let count = 0;
  let weekend = 0;
  let excluded = 0;
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay();
    const key = cursor.toISOString().slice(0, 10);
    if (day === 0 || day === 6) weekend += 1;
    else if (holidays.has(key)) excluded += 1;
    else count += 1;
  }
  return `${text('businessDays')}: ${count}\n${text('weekendDays')}: ${weekend}\n${text('excludedHolidays')}: ${excluded}`;
}

function bmi(values: UtilityValues, text: Text): string {
  const weight = numeric(values, 'weight');
  const height = numeric(values, 'height') / 100;
  if (weight <= 0 || height <= 0) throw new UtilityInputError('bodyPositive');
  const value = weight / height ** 2;
  const category =
    value < 18.5 ? 'underweight' : value < 25 ? 'normal' : value < 30 ? 'overweight' : 'obese';
  return `${text('bmi')}: ${value.toFixed(2)}\n${text('category')}: ${text(category)}`;
}

function loan(values: UtilityValues, text: Text): string {
  const principal = numeric(values, 'principal');
  const annualRate = numeric(values, 'rate') / 100;
  const years = numeric(values, 'years');
  if (principal <= 0 || annualRate < 0 || years <= 0) throw new UtilityInputError('loanRange');
  const payments = Math.round(years * 12);
  const monthlyRate = annualRate / 12;
  const payment =
    monthlyRate === 0
      ? principal / payments
      : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -payments);
  const total = payment * payments;
  return `${text('monthlyPayment')}: ${payment.toFixed(2)}\n${text('totalPayment')}: ${total.toFixed(2)}\n${text('totalInterest')}: ${(total - principal).toFixed(2)}`;
}

function compoundInterest(values: UtilityValues, text: Text): string {
  const principal = numeric(values, 'principal');
  const rate = numeric(values, 'rate') / 100;
  const years = numeric(values, 'years');
  const contribution = numeric(values, 'contribution');
  const frequencies: Record<string, number> = { monthly: 12, quarterly: 4, annually: 1 };
  const frequency = frequencies[values.frequency];
  if (principal < 0 || rate < 0 || years <= 0 || contribution < 0)
    throw new UtilityInputError('investmentRange');
  const periods = Math.round(years * frequency);
  let balance = principal;
  for (let index = 0; index < periods; index += 1)
    balance = balance * (1 + rate / frequency) + contribution;
  const contributed = principal + contribution * periods;
  return `${text('futureValue')}: ${balance.toFixed(2)}\n${text('contributed')}: ${contributed.toFixed(2)}\n${text('interestEarned')}: ${(balance - contributed).toFixed(2)}`;
}

function aspectRatio(values: UtilityValues, text: Text): string {
  const width = Math.round(numeric(values, 'width'));
  const height = Math.round(numeric(values, 'height'));
  const targetWidth = numeric(values, 'targetWidth');
  if (width <= 0 || height <= 0 || targetWidth <= 0) throw new UtilityInputError('dimensions');
  const divisor = Number(bigintGcd(BigInt(width), BigInt(height)));
  return `${text('ratio')}: ${width / divisor}:${height / divisor}\n${text('scaledHeight')}: ${((targetWidth * height) / width).toFixed(2)}`;
}

const today = new Date().toISOString().slice(0, 10);

const mathDefinitions: Record<string, UtilityDefinition> = {
  fractionCalculator: {
    stem: 'fractionCalculator',
    fields: [
      { key: 'left', type: 'text', defaultValue: '1/2' },
      {
        key: 'operator',
        type: 'select',
        defaultValue: 'add',
        options: ['add', 'subtract', 'multiply', 'divide'],
      },
      { key: 'right', type: 'text', defaultValue: '1/3' },
    ],
    compute: calculateFraction,
  },
  quadraticSolver: {
    stem: 'quadraticSolver',
    fields: [
      { key: 'a', type: 'number', defaultValue: '1', step: 'any' },
      { key: 'b', type: 'number', defaultValue: '-3', step: 'any' },
      { key: 'c', type: 'number', defaultValue: '2', step: 'any' },
    ],
    compute: quadratic,
    outputRows: true,
  },
  dateDifference: {
    stem: 'dateDifference',
    fields: [
      { key: 'start', type: 'date', defaultValue: today },
      { key: 'end', type: 'date', defaultValue: today },
    ],
    compute: dateDifference,
    outputRows: true,
  },
  ageCalculator: {
    stem: 'ageCalculator',
    fields: [
      { key: 'birthDate', type: 'date' },
      { key: 'asOf', type: 'date', defaultValue: today },
    ],
    compute: age,
    outputRows: true,
  },
  businessDays: {
    stem: 'businessDays',
    fields: [
      { key: 'start', type: 'date', defaultValue: today },
      { key: 'end', type: 'date', defaultValue: today },
      { key: 'holidays', type: 'textarea' },
    ],
    compute: businessDays,
    outputRows: true,
  },
  bmiCalculator: {
    stem: 'bmiCalculator',
    fields: [
      { key: 'weight', type: 'number', defaultValue: '70', min: '0', step: 'any' },
      { key: 'height', type: 'number', defaultValue: '175', min: '0', step: 'any' },
    ],
    compute: bmi,
    outputRows: true,
  },
  loanCalculator: {
    stem: 'loanCalculator',
    fields: [
      { key: 'principal', type: 'number', defaultValue: '300000', min: '0', step: 'any' },
      { key: 'rate', type: 'number', defaultValue: '5', min: '0', step: 'any' },
      { key: 'years', type: 'number', defaultValue: '30', min: '0', step: 'any' },
    ],
    compute: loan,
    outputRows: true,
  },
  compoundInterest: {
    stem: 'compoundInterest',
    fields: [
      { key: 'principal', type: 'number', defaultValue: '10000', min: '0', step: 'any' },
      { key: 'rate', type: 'number', defaultValue: '6', min: '0', step: 'any' },
      { key: 'years', type: 'number', defaultValue: '10', min: '0', step: 'any' },
      { key: 'contribution', type: 'number', defaultValue: '100', min: '0', step: 'any' },
      {
        key: 'frequency',
        type: 'select',
        defaultValue: 'monthly',
        options: ['monthly', 'quarterly', 'annually'],
      },
    ],
    compute: compoundInterest,
    outputRows: true,
  },
  aspectRatio: {
    stem: 'aspectRatio',
    fields: [
      { key: 'width', type: 'number', defaultValue: '1920', min: '1', step: '1' },
      { key: 'height', type: 'number', defaultValue: '1080', min: '1', step: '1' },
      { key: 'targetWidth', type: 'number', defaultValue: '1280', min: '1', step: 'any' },
    ],
    compute: aspectRatio,
    outputRows: true,
  },
};

export const utilityDefinitions = {
  ...converterDefinitions,
  ...textDefinitions,
  ...cryptoDefinitions,
  ...webDefinitions,
  ...developmentDefinitions,
  ...mathDefinitions,
} as const;
