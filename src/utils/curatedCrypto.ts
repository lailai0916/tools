export type HmacAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export type DigestAlgorithm = HmacAlgorithm | 'MD5' | 'CRC32';
export type IdentifierFormat = 'uuid-v4' | 'uuid-v7' | 'ulid' | 'nanoid';
export type IdentifierOptions = { format: IdentifierFormat; count: number; length?: number };
export type UuidInspection = {
  canonical: string;
  version: number;
  variant: string;
  timestamp?: string;
};
export type SecretPurpose = 'password' | 'token' | 'custom';
export type SecretOptions = {
  purpose: SecretPurpose;
  length: number;
  count: number;
  uppercase?: boolean;
  lowercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
  alphabet?: string;
};
export type SecretResult = { values: string[]; base64?: string[] };

const HASH_ALGORITHMS: readonly string[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
const UUID_EPOCH = 0x01b21dd213814000n;
const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const NANOID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
const PASSWORD_SOURCES = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/|`~',
};
const PASSWORD_DEFAULTS = { uppercase: true, lowercase: true, digits: true, symbols: false };
const PASSWORD_CLASSES = ['uppercase', 'lowercase', 'digits', 'symbols'] as const;
const AMBIGUOUS = new Set('O0oIl1|`');

function requireInteger(value: number, minimum: number, maximum: number, code: string): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error(code);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Draw an unbiased integer in [0, upperExclusive), including a full 32-bit range. */
export function randomBelow(upperExclusive: number): number {
  requireInteger(upperExclusive, 1, 0x100000000, 'range');
  const limit = 0x100000000 - (0x100000000 % upperExclusive);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % upperExclusive;
}

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

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
})();

function crc32(message: string): string {
  let value = 0xffffffff;
  for (const byte of new TextEncoder().encode(message)) {
    value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return ((value ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

/** Hash the UTF-8 message; an empty message is a valid input. */
export async function digestText(message: string, algorithm: DigestAlgorithm): Promise<string> {
  if (algorithm === 'MD5') return md5(message);
  if (algorithm === 'CRC32') return crc32(message);
  if (!HASH_ALGORITHMS.includes(algorithm)) throw new Error('algorithm');
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(message));
  return bytesToHex(new Uint8Array(digest));
}

/** Authenticate the UTF-8 message with a nonempty UTF-8 secret. */
export async function hmacText(
  message: string,
  secret: string,
  algorithm: HmacAlgorithm
): Promise<string> {
  if (!secret.length) throw new Error('secret');
  if (!HASH_ALGORITHMS.includes(algorithm)) throw new Error('algorithm');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(new Uint8Array(signature));
}

function randomUuid(version: 4 | 7): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  if (version === 7) {
    let timestamp = BigInt(Date.now());
    for (let index = 5; index >= 0; index -= 1) {
      bytes[index] = Number(timestamp & 0xffn);
      timestamp >>= 8n;
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | (version << 4);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function randomUlid(): string {
  let time = Date.now();
  let timestamp = '';
  for (let index = 0; index < 10; index += 1) {
    timestamp = ULID_ALPHABET[time % 32] + timestamp;
    time = Math.floor(time / 32);
  }
  // Independent random suffixes do not guarantee monotonic order within one millisecond.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return timestamp + Array.from(bytes, (byte) => ULID_ALPHABET[byte & 31]).join('');
}

function randomCharacters(alphabet: readonly string[], length: number): string {
  return Array.from({ length }, () => alphabet[randomBelow(alphabet.length)]).join('');
}

export function generateIdentifiers({ format, count, length = 21 }: IdentifierOptions): string[] {
  requireInteger(count, 1, 1000, 'count');
  switch (format) {
    case 'uuid-v4':
      return Array.from({ length: count }, () => randomUuid(4));
    case 'uuid-v7':
      return Array.from({ length: count }, () => randomUuid(7));
    case 'ulid':
      return Array.from({ length: count }, randomUlid);
    case 'nanoid': {
      requireInteger(length, 1, 512, 'length');
      const alphabet = [...NANOID_ALPHABET];
      return Array.from({ length: count }, () => randomCharacters(alphabet, length));
    }
    default:
      throw new Error('format');
  }
}

export function inspectUuid(input: string): UuidInspection {
  let value = input
    .trim()
    .toLowerCase()
    .replace(/^urn:uuid:/, '');
  if (value.startsWith('{') && value.endsWith('}')) value = value.slice(1, -1);
  const match = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/.exec(
    value
  );
  if (!match) throw new Error('uuid');
  const version = Number.parseInt(match[3][0], 16);
  const variantNibble = Number.parseInt(match[4][0], 16);
  const result: UuidInspection = {
    canonical: value,
    version,
    variant:
      (variantNibble & 8) === 0
        ? 'NCS'
        : (variantNibble & 12) === 8
          ? 'RFC 4122'
          : (variantNibble & 14) === 12
            ? 'Microsoft'
            : 'Future',
  };
  if (version === 7 && result.variant === 'RFC 4122') {
    result.timestamp = new Date(Number.parseInt(match[1] + match[2], 16)).toISOString();
  } else if (version === 1 && result.variant === 'RFC 4122') {
    const timestamp = BigInt(`0x${match[3].slice(1)}${match[2]}${match[1]}`) - UUID_EPOCH;
    // Floor sub-millisecond values consistently, including timestamps before the Unix epoch.
    const milliseconds = timestamp >= 0n ? timestamp / 10000n : (timestamp - 9999n) / 10000n;
    result.timestamp = new Date(Number(milliseconds)).toISOString();
  }
  return result;
}

function passwordPools(options: SecretOptions): string[][] {
  const pools = PASSWORD_CLASSES.filter(
    (category) => options[category] ?? PASSWORD_DEFAULTS[category]
  ).map((category) =>
    [...PASSWORD_SOURCES[category]].filter(
      (character) => !options.excludeAmbiguous || !AMBIGUOUS.has(character)
    )
  );
  if (!pools.length || pools.some((pool) => !pool.length)) throw new Error('classes');
  return pools;
}

function randomPassword(length: number, pools: readonly string[][]): string {
  const alphabet = pools.flat();
  const characters = pools.map((pool) => pool[randomBelow(pool.length)]);
  while (characters.length < length) characters.push(alphabet[randomBelow(alphabet.length)]);
  // Shuffle the guaranteed characters with all other characters to avoid fixed class positions.
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = randomBelow(index + 1);
    [characters[index], characters[swap]] = [characters[swap], characters[index]];
  }
  return characters.join('');
}

export function generateSecrets(options: SecretOptions): SecretResult {
  const { purpose, length, count } = options;
  requireInteger(count, 1, 100, 'count');
  switch (purpose) {
    case 'password': {
      requireInteger(length, 4, 128, 'length');
      const pools = passwordPools(options);
      return { values: Array.from({ length: count }, () => randomPassword(length, pools)) };
    }
    case 'token': {
      requireInteger(length, 1, 512, 'length');
      const tokens = Array.from({ length: count }, () =>
        crypto.getRandomValues(new Uint8Array(length))
      );
      return { values: tokens.map(bytesToHex), base64: tokens.map(bytesToBase64) };
    }
    case 'custom': {
      requireInteger(length, 1, 4096, 'length');
      const alphabet = [...new Set(options.alphabet ?? '')];
      if (!alphabet.length) throw new Error('alphabet');
      // Limits above cap each batch at 409,600 Unicode code points.
      return { values: Array.from({ length: count }, () => randomCharacters(alphabet, length)) };
    }
    default:
      throw new Error('purpose');
  }
}
