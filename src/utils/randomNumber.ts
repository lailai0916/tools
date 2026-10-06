export const MAX_RANDOM_NUMBER_COUNT = 1000;
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

export type RandomNumberParams = { lo: number; hi: number; k: number; size: number };

/** Parse the original decimal text before converting it to a JavaScript number. */
export function parseDecimalInteger(input: string): number | null {
  const value = input.trim();
  if (!/^[+-]?\d+$/.test(value)) return null;
  const integer = BigInt(value);
  if (integer < -MAX_SAFE_INTEGER || integer > MAX_SAFE_INTEGER) return null;
  return Number(integer);
}

/** Draw an unbiased integer in [0, upperExclusive), with 64-bit draws for large ranges. */
export function randomBelow(upperExclusive: number): number {
  if (!Number.isSafeInteger(upperExclusive) || upperExclusive < 1) {
    throw new RangeError('range');
  }
  if (upperExclusive === 1) return 0;
  if (upperExclusive <= 0x100000000) {
    const limit = 0x100000000 - (0x100000000 % upperExclusive);
    const buffer = new Uint32Array(1);
    let value: number;
    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % upperExclusive;
  }
  const big = BigInt(upperExclusive);
  const range = 1n << 64n;
  const limit = range - (range % big);
  const buffer = new Uint32Array(2);
  let value: bigint;
  do {
    crypto.getRandomValues(buffer);
    value = (BigInt(buffer[0]) << 32n) | BigInt(buffer[1]);
  } while (value >= limit);
  return Number(value % big);
}

export function drawUnique(min: number, size: number, count: number): number[] {
  if (
    !Number.isSafeInteger(min) ||
    !Number.isSafeInteger(size) ||
    size < 1 ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > MAX_RANDOM_NUMBER_COUNT ||
    count > size ||
    BigInt(min) + BigInt(size) - 1n > MAX_SAFE_INTEGER
  ) {
    throw new RangeError('range');
  }
  // Materialize and partial-shuffle small pools; reject duplicates for larger pools.
  if (size <= 100000) {
    const pool = Array.from({ length: size }, (_, index) => index);
    for (let index = 0; index < count; index += 1) {
      const swap = index + randomBelow(size - index);
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
    return pool.slice(0, count).map((value) => value + min);
  }
  const seen = new Set<number>();
  const output: number[] = [];
  while (output.length < count) {
    const value = randomBelow(size);
    if (!seen.has(value)) {
      seen.add(value);
      output.push(value + min);
    }
  }
  return output;
}

export function validateRandomNumberParams(
  minInput: string,
  maxInput: string,
  countInput: string
): RandomNumberParams | null {
  const lo = parseDecimalInteger(minInput);
  const hi = parseDecimalInteger(maxInput);
  const k = parseDecimalInteger(countInput);
  if (lo === null || hi === null || k === null || lo > hi || k < 1 || k > MAX_RANDOM_NUMBER_COUNT) {
    return null;
  }
  const size = BigInt(hi) - BigInt(lo) + 1n;
  if (size > MAX_SAFE_INTEGER) return null;
  return { lo, hi, k, size: Number(size) };
}

export function buildRandomNumbers(
  minInput: string,
  maxInput: string,
  countInput: string,
  unique: boolean
): string {
  const params = validateRandomNumberParams(minInput, maxInput, countInput);
  if (!params || (unique && params.k > params.size)) return '';
  const numbers = unique
    ? drawUnique(params.lo, params.size, params.k)
    : Array.from({ length: params.k }, () => params.lo + randomBelow(params.size));
  return numbers.join('\n');
}
