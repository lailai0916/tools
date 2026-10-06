export type CuratedWebErrorCode =
  | 'url'
  | 'queryJson'
  | 'queryValue'
  | 'encoding'
  | 'relativePath'
  | 'utm'
  | 'headers'
  | 'cookies'
  | 'basicAuth'
  | 'username'
  | 'ipv4'
  | 'prefix';

export class CuratedWebError extends Error {
  constructor(public readonly code: CuratedWebErrorCode) {
    super(code);
    this.name = 'CuratedWebError';
  }
}

export type QueryRecord = Record<string, string | string[]>;

export function parseUrl(input: string): URL {
  if (!input.trim()) throw new CuratedWebError('url');
  try {
    return new URL(input.trim());
  } catch {
    throw new CuratedWebError('url');
  }
}

function queryParams(input: string): URLSearchParams {
  const query = input.replace(/^\?/, '');
  try {
    // URLSearchParams silently repairs malformed escapes; reject them instead.
    for (const pair of query.split('&')) {
      for (const part of pair.split('=')) decodeURIComponent(part.replace(/\+/g, ' '));
    }
  } catch {
    throw new CuratedWebError('encoding');
  }
  return new URLSearchParams(query);
}

export function parseQuery(input: string): QueryRecord {
  const result: QueryRecord = Object.create(null) as QueryRecord;
  for (const [key, value] of queryParams(input)) {
    const previous = result[key];
    result[key] =
      previous === undefined
        ? value
        : Array.isArray(previous)
          ? [...previous, value]
          : [previous, value];
  }
  return result;
}

export function queryToJson(input: string): string {
  return JSON.stringify(parseQuery(input), null, 2);
}

export function jsonToQuery(input: string): string {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new CuratedWebError('queryJson');
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CuratedWebError('queryJson');
  }
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') params.append(key, item);
    else if (Array.isArray(item) && item.every((entry) => typeof entry === 'string')) {
      for (const entry of item) params.append(key, entry);
    } else throw new CuratedWebError('queryValue');
  }
  return params.toString();
}

export function updateUrlQuery(input: string, query: string): string {
  const url = parseUrl(input);
  // Validate without reordering interleaved duplicate parameters.
  queryParams(query);
  url.search = query.replace(/^\?/, '');
  return url.href;
}

export function resolveUrl(input: string, relative: string): string {
  const base = parseUrl(input);
  if (!relative.trim()) throw new CuratedWebError('relativePath');
  try {
    return new URL(relative.trim(), base).href;
  } catch {
    throw new CuratedWebError('relativePath');
  }
}

export type UtmValues = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

export function buildUtm(input: string, values: UtmValues): string {
  const url = parseUrl(input);
  if (!['http:', 'https:'].includes(url.protocol)) throw new CuratedWebError('url');
  if (!values.source.trim() || !values.medium.trim() || !values.campaign.trim()) {
    throw new CuratedWebError('utm');
  }
  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) url.searchParams.set(`utm_${key}`, value.trim());
    else url.searchParams.delete(`utm_${key}`);
  }
  return url.href;
}

const TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function hasControlCharacters(input: string, allowTab = false): boolean {
  return Array.from(input).some((character) => {
    const code = character.charCodeAt(0);
    return (code < 32 && !(allowTab && code === 9)) || code === 127;
  });
}

function appendValue(result: QueryRecord, key: string, value: string) {
  const previous = result[key];
  result[key] =
    previous === undefined
      ? value
      : Array.isArray(previous)
        ? [...previous, value]
        : [previous, value];
}

export function parseHttpHeaders(input: string): QueryRecord {
  if (!input.trim()) throw new CuratedWebError('headers');
  const result: QueryRecord = Object.create(null) as QueryRecord;
  for (const line of input.split(/\r?\n/)) {
    if (!line) continue;
    const separator = line.indexOf(':');
    const name = line.slice(0, separator);
    const rawValue = line.slice(separator + 1);
    if (separator < 1 || !TOKEN.test(name) || hasControlCharacters(rawValue, true)) {
      throw new CuratedWebError('headers');
    }
    appendValue(result, name.toLowerCase(), rawValue.replace(/^[ \t]+|[ \t]+$/g, ''));
  }
  return result;
}

export function parseCookies(input: string): QueryRecord {
  const source = input.trim().replace(/^Cookie:[ \t]*/i, '');
  if (!source) throw new CuratedWebError('cookies');
  const result: QueryRecord = Object.create(null) as QueryRecord;
  for (const part of source.split(';')) {
    const cookie = part.trim();
    const separator = cookie.indexOf('=');
    const name = cookie.slice(0, separator);
    let value = cookie.slice(separator + 1);
    if (separator < 1 || !TOKEN.test(name)) throw new CuratedWebError('cookies');
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1);
    }
    if (!/^[\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]*$/.test(value)) {
      throw new CuratedWebError('cookies');
    }
    appendValue(result, name, value);
  }
  return result;
}

function validateCredentials(username: string, password: string) {
  if (username.includes(':')) throw new CuratedWebError('username');
  if (hasControlCharacters(username + password)) throw new CuratedWebError('basicAuth');
}

export function encodeBasicAuth(username: string, password: string): string {
  validateCredentials(username, password);
  const credentials = `${username}:${password}`;
  const bytes = new TextEncoder().encode(credentials);
  if (new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes) !== credentials) {
    throw new CuratedWebError('basicAuth');
  }
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Authorization: Basic ${btoa(binary)}`;
}

export function decodeBasicAuth(input: string): { username: string; password: string } {
  const payload = input
    .trim()
    .replace(/^Authorization:[ \t]*/i, '')
    .replace(/^Basic[ \t]+/i, '');
  if (
    !payload ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(payload)
  ) {
    throw new CuratedWebError('basicAuth');
  }
  try {
    const binary = atob(payload);
    if (btoa(binary) !== payload) throw new CuratedWebError('basicAuth');
    const decoded = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      Uint8Array.from(binary, (character) => character.charCodeAt(0))
    );
    const separator = decoded.indexOf(':');
    if (separator < 0) throw new CuratedWebError('basicAuth');
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    validateCredentials(username, password);
    return { username, password };
  } catch {
    throw new CuratedWebError('basicAuth');
  }
}

export type Ipv4Format = 'ipv4' | 'decimal' | 'hex' | 'binary';

function formatIpv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

export function ipv4ToNumber(input: string, format: Ipv4Format = 'ipv4'): number {
  const source = input.trim();
  if (format === 'decimal') {
    if (!/^\d{1,10}$/.test(source) || Number(source) > 0xffffffff) {
      throw new CuratedWebError('ipv4');
    }
    return Number(source);
  }
  if (format === 'hex') {
    const hex = source.replace(/^0x/i, '');
    if (!/^[0-9a-f]{1,8}$/i.test(hex)) throw new CuratedWebError('ipv4');
    return Number.parseInt(hex, 16);
  }
  if (format === 'binary') {
    if (!/^(?:[01]{32}|[01]{8}(?:\.[01]{8}){3})$/.test(source)) {
      throw new CuratedWebError('ipv4');
    }
    return Number.parseInt(source.replaceAll('.', ''), 2);
  }
  const parts = source.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    throw new CuratedWebError('ipv4');
  }
  return parts.reduce((value, part) => value * 256 + Number(part), 0);
}

export function inspectIpv4(input: string, prefixInput: string, format: Ipv4Format = 'ipv4') {
  const value = ipv4ToNumber(input, format);
  if (!/^\d{1,2}$/.test(prefixInput) || Number(prefixInput) > 32) {
    throw new CuratedWebError('prefix');
  }
  const prefix = Number(prefixInput);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (value & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const total = 2 ** (32 - prefix);
  return {
    address: formatIpv4(value),
    decimal: String(value),
    binary: [24, 16, 8, 0]
      .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, '0'))
      .join('.'),
    hex: `0x${value.toString(16).toUpperCase().padStart(8, '0')}`,
    prefix,
    network: formatIpv4(network),
    broadcast: prefix >= 31 ? null : formatIpv4(broadcast),
    netmask: formatIpv4(mask),
    total,
    usable: prefix >= 31 ? total : total - 2,
    firstHost: formatIpv4(prefix >= 31 ? network : network + 1),
    lastHost: formatIpv4(prefix >= 31 ? broadcast : broadcast - 1),
  };
}
