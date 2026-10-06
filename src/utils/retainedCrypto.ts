export type RetainedCryptoErrorCode =
  | 'jwtFormat'
  | 'base64url'
  | 'utf8'
  | 'json'
  | 'object'
  | 'number'
  | 'claim'
  | 'base32'
  | 'uri'
  | 'options'
  | 'counter';

export class RetainedCryptoError extends Error {
  constructor(public readonly code: RetainedCryptoErrorCode) {
    super(code);
    this.name = 'RetainedCryptoError';
  }
}

export type JwtInspection = { header: string; payload: string; signature: string };
export type TotpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';
export type TotpConfig = {
  secret: Uint8Array;
  algorithm: TotpAlgorithm;
  digits: 6 | 8;
  period: number;
};

function decodeBase64Url(segment: string, allowEmpty = false): Uint8Array {
  if (segment === '' && allowEmpty) return new Uint8Array();
  if (!/^[A-Za-z0-9_-]+$/.test(segment) || segment.length % 4 === 1) {
    throw new RetainedCryptoError('base64url');
  }
  let binary: string;
  try {
    const standard = segment.replace(/-/g, '+').replace(/_/g, '/');
    binary = atob(standard.padEnd(Math.ceil(standard.length / 4) * 4, '='));
  } catch {
    throw new RetainedCryptoError('base64url');
  }
  const canonical = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (canonical !== segment) throw new RetainedCryptoError('base64url');
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decimalValue(source: string): string {
  const negative = source.startsWith('-');
  const unsigned = negative ? source.slice(1) : source;
  const [mantissa, power = '0'] = unsigned.toLowerCase().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  let digits = (whole + fraction).replace(/^0+/, '');
  if (!digits) return '0';
  let exponent = Number(power) - fraction.length;
  while (digits.endsWith('0')) {
    digits = digits.slice(0, -1);
    exponent += 1;
  }
  return (negative ? '-' : '') + digits + 'e' + exponent;
}

/** Reject numbers that would be changed when the decoded JSON is displayed or copied. */
function validateJsonNumbers(source: string): void {
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') {
      quoted = true;
      continue;
    }
    if (character !== '-' && !/[0-9]/.test(character)) continue;
    const token = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(index))?.[0];
    if (!token) throw new RetainedCryptoError('json');
    const value = Number(token);
    if (
      !Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value)) ||
      decimalValue(token) !== decimalValue(String(value))
    ) {
      throw new RetainedCryptoError('number');
    }
    index += token.length - 1;
  }
}

function decodeJsonObject(segment: string): Record<string, unknown> {
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      decodeBase64Url(segment)
    );
  } catch (error) {
    if (error instanceof RetainedCryptoError) throw error;
    throw new RetainedCryptoError('utf8');
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new RetainedCryptoError('json');
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new RetainedCryptoError('object');
  validateJsonNumbers(text);
  return value as Record<string, unknown>;
}

export function inspectJwt(input: string): JwtInspection {
  const segments = input.trim().split('.');
  if (segments.length !== 3) throw new RetainedCryptoError('jwtFormat');
  const header = decodeJsonObject(segments[0]);
  const payload = decodeJsonObject(segments[1]);
  if (typeof header.alg !== 'string' || !header.alg) throw new RetainedCryptoError('jwtFormat');
  for (const name of ['exp', 'iat', 'nbf']) {
    if (
      Object.hasOwn(payload, name) &&
      (typeof payload[name] !== 'number' || !Number.isFinite(payload[name]))
    ) {
      throw new RetainedCryptoError('claim');
    }
  }
  if ((header.alg === 'none') !== (segments[2] === '')) throw new RetainedCryptoError('jwtFormat');
  decodeBase64Url(segments[2], header.alg === 'none');
  return {
    header: JSON.stringify(header, null, 2),
    payload: JSON.stringify(payload, null, 2),
    signature: segments[2],
  };
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_PADDING = new Map([
  [0, 0],
  [2, 6],
  [4, 4],
  [5, 3],
  [7, 1],
]);

export function decodeBase32Secret(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, '').toUpperCase();
  const match = /^([A-Z2-7]+)(=*)$/.exec(clean);
  if (!match) throw new RetainedCryptoError('base32');
  const [, body, padding] = match;
  const expectedPadding = BASE32_PADDING.get(body.length % 8);
  if (
    expectedPadding === undefined ||
    (padding.length > 0 && (padding.length !== expectedPadding || clean.length % 8 !== 0))
  ) {
    throw new RetainedCryptoError('base32');
  }
  const bytes: number[] = [];
  let value = 0;
  let bits = 0;
  for (const character of body) {
    value = (value << 5) | BASE32.indexOf(character);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  if (!bytes.length || (value & ((1 << bits) - 1)) !== 0) throw new RetainedCryptoError('base32');
  return new Uint8Array(bytes);
}

function positiveInteger(input: string): number {
  if (!/^\d+$/.test(input)) throw new RetainedCryptoError('options');
  const value = BigInt(input);
  if (value < 1n || value > BigInt(Number.MAX_SAFE_INTEGER))
    throw new RetainedCryptoError('options');
  return Number(value);
}

export function parseTotpConfig(input: string): TotpConfig {
  let secret = input.trim();
  let algorithm: TotpAlgorithm = 'SHA-1';
  let digits: 6 | 8 = 6;
  let period = 30;
  if (/^otpauth:\/\//i.test(secret)) {
    let uri: URL;
    try {
      uri = new URL(secret);
    } catch {
      throw new RetainedCryptoError('uri');
    }
    let label: string;
    try {
      label = decodeURIComponent(uri.pathname.slice(1));
    } catch {
      throw new RetainedCryptoError('uri');
    }
    if (
      uri.protocol !== 'otpauth:' ||
      uri.hostname.toLowerCase() !== 'totp' ||
      uri.username ||
      uri.password ||
      uri.port ||
      !label.trim()
    )
      throw new RetainedCryptoError('uri');
    for (const name of ['secret', 'algorithm', 'digits', 'period']) {
      if (uri.searchParams.getAll(name).length > 1) throw new RetainedCryptoError('uri');
    }
    secret = uri.searchParams.get('secret') ?? '';
    const requestedAlgorithm = uri.searchParams.get('algorithm') ?? 'SHA1';
    const match = /^SHA-?(1|256|512)$/i.exec(requestedAlgorithm);
    if (!match) throw new RetainedCryptoError('options');
    algorithm = ('SHA-' + match[1]) as TotpAlgorithm;
    const requestedDigits = positiveInteger(uri.searchParams.get('digits') ?? '6');
    if (requestedDigits !== 6 && requestedDigits !== 8) throw new RetainedCryptoError('options');
    digits = requestedDigits;
    period = positiveInteger(uri.searchParams.get('period') ?? '30');
  }
  return { secret: decodeBase32Secret(secret), algorithm, digits, period };
}

export function getTotpTime(
  milliseconds: number,
  period: number
): { counter: number; remaining: number } {
  if (
    !Number.isFinite(milliseconds) ||
    milliseconds < 0 ||
    milliseconds > Number.MAX_SAFE_INTEGER ||
    !Number.isSafeInteger(period) ||
    period < 1
  )
    throw new RetainedCryptoError('counter');
  const seconds = Math.floor(milliseconds / 1000);
  return { counter: Math.floor(seconds / period), remaining: period - (seconds % period) };
}

export async function generateTotpCode(config: TotpConfig, counter: number): Promise<string> {
  if (!Number.isSafeInteger(counter) || counter < 0) throw new RetainedCryptoError('counter');
  if (
    ![6, 8].includes(config.digits) ||
    !['SHA-1', 'SHA-256', 'SHA-512'].includes(config.algorithm) ||
    !config.secret.length
  )
    throw new RetainedCryptoError('options');
  const key = await crypto.subtle.importKey(
    'raw',
    config.secret as BufferSource,
    { name: 'HMAC', hash: config.algorithm },
    false,
    ['sign']
  );
  const bytes = new Uint8Array(8);
  let value = BigInt(counter);
  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = Number(value & 0xffn);
    value >>= 8n;
  }
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes));
  const offset = signature[signature.length - 1] & 15;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3];
  return String(binary % 10 ** config.digits).padStart(config.digits, '0');
}
