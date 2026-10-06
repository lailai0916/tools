export const CODEC_FORMATS = [
  'base64',
  'base32',
  'base58',
  'hex',
  'binary',
  'url',
  'html',
  'json',
  'svg',
] as const;

export type CodecFormat = (typeof CODEC_FORMATS)[number];
export type CodecMode = 'encode' | 'decode';
export type TextCodecErrorCode =
  | 'invalidEncoding'
  | 'invalidUtf8'
  | 'invalidUnicode'
  | 'invalidJson'
  | 'invalidSvg'
  | 'invalidSvgUri';

export class TextCodecError extends Error {
  constructor(public readonly code: TextCodecErrorCode) {
    super(code);
    this.name = 'TextCodecError';
  }
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function isCodecFormat(value: string | null): value is CodecFormat {
  return CODEC_FORMATS.some((format) => format === value);
}

function assertUnicode(input: string): void {
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = input.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TextCodecError('invalidUnicode');
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TextCodecError('invalidUnicode');
    }
  }
}

function decodeUtf8(bytes: Uint8Array): string {
  try {
    // Keep a leading BOM as text, so decoding reverses encoding exactly.
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new TextCodecError('invalidUtf8');
  }
}

function withoutAsciiWhitespace(input: string): string {
  return input.replace(/[\t\n\f\r ]/g, '');
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(input: string): Uint8Array {
  const clean = withoutAsciiWhitespace(input);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) throw new TextCodecError('invalidEncoding');
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(clean), (character) => character.charCodeAt(0));
  } catch {
    throw new TextCodecError('invalidEncoding');
  }
  const canonical = encodeBase64(bytes);
  const expected = clean.includes('=') ? canonical : canonical.replace(/=+$/, '');
  // Re-encoding checks legal lengths, exact padding, and zero unused bits.
  if (clean !== expected) throw new TextCodecError('invalidEncoding');
  return bytes;
}

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_ALPHABET[(value >>> bits) & 31];
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) output += BASE32_ALPHABET[value << (5 - bits)];
  return output.padEnd(Math.ceil(output.length / 8) * 8, '=');
}

function decodeBase32(input: string): Uint8Array {
  const compact = withoutAsciiWhitespace(input);
  if (!/^[A-Z2-7]*={0,6}$/i.test(compact)) throw new TextCodecError('invalidEncoding');
  const clean = compact.toUpperCase();
  const payload = clean.replace(/=+$/, '');
  if (![0, 2, 4, 5, 7].includes(payload.length % 8)) {
    throw new TextCodecError('invalidEncoding');
  }
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const character of payload) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(character);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 255);
    }
    value &= (1 << bits) - 1;
  }
  const bytes = new Uint8Array(output);
  const canonical = encodeBase32(bytes);
  const expected = clean.includes('=') ? canonical : canonical.replace(/=+$/, '');
  if (clean !== expected) throw new TextCodecError('invalidEncoding');
  return bytes;
}

function encodeBase58(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  let output = '';
  while (value > 0n) {
    output = BASE58_ALPHABET[Number(value % 58n)] + output;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    output = '1' + output;
  }
  return output;
}

function decodeBase58(input: string): Uint8Array {
  const clean = withoutAsciiWhitespace(input);
  let value = 0n;
  for (const character of clean) {
    const digit = BASE58_ALPHABET.indexOf(character);
    if (digit < 0) throw new TextCodecError('invalidEncoding');
    value = value * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (value > 0n) {
    bytes.push(Number(value & 255n));
    value >>= 8n;
  }
  for (const character of clean) {
    if (character !== '1') break;
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

function decodeHex(input: string): Uint8Array {
  const tokens = input.split(/[\t\n\f\r ]+/).filter(Boolean);
  if (tokens.some((token) => !/^(?:[0-9a-f]{2})+$/i.test(token))) {
    throw new TextCodecError('invalidEncoding');
  }
  const clean = withoutAsciiWhitespace(input);
  return Uint8Array.from(clean.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

function decodeBinary(input: string): Uint8Array {
  const tokens = input.split(/[\t\n\f\r ]+/).filter(Boolean);
  if (tokens.some((token) => !/^(?:[01]{8})+$/.test(token))) {
    throw new TextCodecError('invalidEncoding');
  }
  const clean = withoutAsciiWhitespace(input);
  return Uint8Array.from(clean.match(/.{8}/g) ?? [], (byte) => Number.parseInt(byte, 2));
}

function encodeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeHtml(input: string): string {
  const parser = new DOMParser();
  // A pasted document often repeats the same escapes thousands of times. Keep the
  // browser's entity rules, but parse each exact token only once for this input.
  const decoded = new Map<string, string>();
  // Only entity-shaped tokens reach the HTML parser. Literal tags, line endings,
  // and strings such as </textarea> stay text; decoded markup is never re-parsed.
  return input.replace(/&(?:#(?:[xX][0-9a-f]+|[0-9]+);?|[a-z][a-z0-9]*;?)/gi, (entity) => {
    const cached = decoded.get(entity);
    if (cached !== undefined) return cached;
    const document = parser.parseFromString(`<!doctype html><body>${entity}`, 'text/html');
    const text = document.body.textContent ?? entity;
    decoded.set(entity, text);
    return text;
  });
}

function assertSvg(input: string): void {
  assertUnicode(input);
  const document = new DOMParser().parseFromString(input, 'image/svg+xml');
  const root = document.documentElement;
  if (
    document.getElementsByTagName('parsererror').length > 0 ||
    root.localName !== 'svg' ||
    (root.namespaceURI !== null && root.namespaceURI !== SVG_NAMESPACE)
  ) {
    throw new TextCodecError('invalidSvg');
  }
}

function decodeSvg(input: string): string {
  const match = /^data:image\/svg\+xml((?:;[^,]*)?),([\s\S]*)$/i.exec(input.trim());
  if (!match) throw new TextCodecError('invalidSvgUri');
  const parameters = match[1].toLowerCase().split(';').filter(Boolean);
  if (
    new Set(parameters).size !== parameters.length ||
    parameters.some((parameter) => !['charset=utf-8', 'utf8', 'base64'].includes(parameter)) ||
    (parameters.includes('charset=utf-8') && parameters.includes('utf8'))
  ) {
    throw new TextCodecError('invalidSvgUri');
  }
  let svg: string;
  if (parameters.includes('base64')) {
    svg = decodeUtf8(decodeBase64(match[2]));
  } else {
    try {
      svg = decodeURIComponent(match[2]);
    } catch {
      throw new TextCodecError('invalidSvgUri');
    }
  }
  assertSvg(svg);
  return svg;
}

export function encodeTextCodec(input: string, format: CodecFormat): string {
  assertUnicode(input);
  const bytes = new TextEncoder().encode(input);
  switch (format) {
    case 'base64':
      return encodeBase64(bytes);
    case 'base32':
      return encodeBase32(bytes);
    case 'base58':
      return encodeBase58(bytes);
    case 'hex':
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
    case 'binary':
      return Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join(' ');
    case 'url':
      return encodeURIComponent(input);
    case 'html':
      return encodeHtml(input);
    case 'json':
      return JSON.stringify(input).slice(1, -1);
    case 'svg':
      assertSvg(input);
      return `data:image/svg+xml,${encodeURIComponent(input)}`;
  }
}

export function decodeTextCodec(input: string, format: CodecFormat): string {
  let output: string;
  switch (format) {
    case 'base64':
      return decodeUtf8(decodeBase64(input));
    case 'base32':
      return decodeUtf8(decodeBase32(input));
    case 'base58':
      return decodeUtf8(decodeBase58(input));
    case 'hex':
      return decodeUtf8(decodeHex(input));
    case 'binary':
      return decodeUtf8(decodeBinary(input));
    case 'url':
      try {
        output = decodeURIComponent(input);
      } catch {
        throw new TextCodecError('invalidEncoding');
      }
      break;
    case 'html':
      output = decodeHtml(input);
      break;
    case 'json':
      try {
        output = JSON.parse(`"${input}"`) as string;
      } catch {
        throw new TextCodecError('invalidJson');
      }
      break;
    case 'svg':
      return decodeSvg(input);
  }
  assertUnicode(output);
  return output;
}

export function convertTextCodec(input: string, format: CodecFormat, mode: CodecMode): string {
  return mode === 'encode' ? encodeTextCodec(input, format) : decodeTextCodec(input, format);
}
