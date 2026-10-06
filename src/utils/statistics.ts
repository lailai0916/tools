export type VarianceMode = 'population' | 'sample';
export type StatisticsErrorCode = 'syntax' | 'range';

export class StatisticsError extends Error {
  constructor(public readonly code: StatisticsErrorCode) {
    super(code);
    this.name = 'StatisticsError';
  }
}

export type StatisticsValues = {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  variance: number | null;
  stddev: number | null;
};

export type StatisticsResult =
  | { kind: 'empty' }
  | { kind: 'invalid'; reason: StatisticsErrorCode }
  | { kind: 'ok'; values: StatisticsValues };

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

function finite(value: number): number {
  if (!Number.isFinite(value)) throw new StatisticsError('range');
  return value;
}

function divide(value: number, divisor: number): number {
  const result = finite(value / divisor);
  if (value !== 0 && result === 0) throw new StatisticsError('range');
  return result;
}

export function formatStatisticNumber(value: number): string {
  return Object.is(value, -0) ? '0' : String(value);
}

export function parseStatisticsNumbers(input: string): number[] {
  const tokens = input
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  return tokens.map((token) => {
    if (!DECIMAL.test(token)) throw new StatisticsError('syntax');
    const value = finite(Number(token));
    // Check the coefficient rather than the exponent: 0e-999 is still exactly zero.
    if (value === 0 && /[1-9]/.test(token.split(/[eE]/)[0])) {
      throw new StatisticsError('range');
    }
    return value;
  });
}

/** Neumaier summation retains small addends when larger values cancel. */
export function compensatedSum(values: readonly number[]): number {
  let sum = 0;
  let correction = 0;
  for (const value of values) {
    finite(value);
    const next = finite(sum + value);
    correction = finite(
      correction + (Math.abs(sum) >= Math.abs(value) ? sum - next + value : value - next + sum)
    );
    sum = next;
  }
  return finite(sum + correction);
}

export function calculateStatistics(
  values: readonly number[],
  varianceMode: VarianceMode = 'population'
): StatisticsValues {
  if (!values.length) throw new StatisticsError('syntax');
  const count = values.length;
  const sum = compensatedSum(values);
  const mean = divide(sum, count);
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = finite(max - min);
  const middle = Math.floor(count / 2);
  const middleSum = count % 2 === 0 ? sorted[middle - 1] + sorted[middle] : 0;
  const median =
    count % 2 === 1
      ? sorted[middle]
      : Number.isFinite(middleSum)
        ? divide(middleSum, 2)
        : finite(sorted[middle - 1] / 2 + sorted[middle] / 2);

  const frequencies = new Map<number, number>();
  let maxFrequency = 0;
  for (const value of values) {
    const frequency = (frequencies.get(value) ?? 0) + 1;
    frequencies.set(value, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
  }
  const modes = [...frequencies]
    .filter(([, frequency]) => frequency === maxFrequency)
    .map(([value]) => value);

  let variance: number | null = null;
  let stddev: number | null = null;
  if (varianceMode === 'population' || count >= 2) {
    // Subtract a nearby origin before averaging to preserve small differences at large offsets.
    const offsets = values.map((value) => finite(value - min));
    const offsetMean = divide(compensatedSum(offsets), count);
    const deviations = offsets.map((offset) => offset - offsetMean);
    const scale = Math.max(offsetMean, range - offsetMean);
    if (scale === 0) {
      variance = 0;
      stddev = 0;
    } else {
      const normalizedSquares = compensatedSum(deviations.map((value) => (value / scale) ** 2));
      const normalizedVariance = divide(
        normalizedSquares,
        varianceMode === 'sample' ? count - 1 : count
      );
      stddev = finite(scale * Math.sqrt(normalizedVariance));
      variance = finite(stddev * stddev);
      // A nonconstant dataset must not be reported as having zero variance after squaring underflows.
      if (stddev === 0 || variance === 0) throw new StatisticsError('range');
    }
  }
  return { count, sum, mean, median, modes, min, max, range, variance, stddev };
}

export function computeStatistics(
  input: string,
  varianceMode: VarianceMode = 'population'
): StatisticsResult {
  try {
    const values = parseStatisticsNumbers(input);
    if (!values.length) return { kind: 'empty' };
    return { kind: 'ok', values: calculateStatistics(values, varianceMode) };
  } catch (error) {
    if (error instanceof StatisticsError) return { kind: 'invalid', reason: error.code };
    throw error;
  }
}
