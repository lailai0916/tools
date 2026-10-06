export type UnitDimension = 'length' | 'temperature' | 'data' | 'duration' | 'angle';
export type ConversionUnit = {
  id: string;
  symbol: string;
  label: string;
  factor: number;
  offset?: number;
  system?: 'si' | 'iec';
};

// Factors express the base unit: metres, kelvin, bytes, seconds, or turns.
export const CONVERSION_UNITS: Record<UnitDimension, readonly ConversionUnit[]> = {
  length: [
    { id: 'meter', symbol: 'm', label: 'meter', factor: 1 },
    { id: 'kilometer', symbol: 'km', label: 'kilometer', factor: 1000 },
    { id: 'centimeter', symbol: 'cm', label: 'centimeter', factor: 0.01 },
    { id: 'millimeter', symbol: 'mm', label: 'millimeter', factor: 0.001 },
    { id: 'mile', symbol: 'mi', label: 'mile', factor: 1609.344 },
    { id: 'yard', symbol: 'yd', label: 'yard', factor: 0.9144 },
    { id: 'foot', symbol: 'ft', label: 'foot', factor: 0.3048 },
    { id: 'inch', symbol: 'in', label: 'inch', factor: 0.0254 },
  ],
  temperature: [
    { id: 'celsius', symbol: '°C', label: 'celsius', factor: 1, offset: 273.15 },
    { id: 'fahrenheit', symbol: '°F', label: 'fahrenheit', factor: 5 / 9, offset: 459.67 },
    { id: 'kelvin', symbol: 'K', label: 'kelvin', factor: 1, offset: 0 },
  ],
  data: [
    { id: 'B', symbol: 'B', label: 'bytes', factor: 1 },
    { id: 'bit', symbol: 'bit', label: 'bits', factor: 1 / 8 },
    { id: 'kB', symbol: 'kB', label: 'kB', factor: 1000, system: 'si' },
    { id: 'MB', symbol: 'MB', label: 'MB', factor: 1000 ** 2, system: 'si' },
    { id: 'GB', symbol: 'GB', label: 'GB', factor: 1000 ** 3, system: 'si' },
    { id: 'TB', symbol: 'TB', label: 'TB', factor: 1000 ** 4, system: 'si' },
    { id: 'PB', symbol: 'PB', label: 'PB', factor: 1000 ** 5, system: 'si' },
    { id: 'KiB', symbol: 'KiB', label: 'KiB', factor: 1024, system: 'iec' },
    { id: 'MiB', symbol: 'MiB', label: 'MiB', factor: 1024 ** 2, system: 'iec' },
    { id: 'GiB', symbol: 'GiB', label: 'GiB', factor: 1024 ** 3, system: 'iec' },
    { id: 'TiB', symbol: 'TiB', label: 'TiB', factor: 1024 ** 4, system: 'iec' },
    { id: 'PiB', symbol: 'PiB', label: 'PiB', factor: 1024 ** 5, system: 'iec' },
  ],
  duration: [
    { id: 'ms', symbol: 'ms', label: 'milliseconds', factor: 0.001 },
    { id: 'seconds', symbol: 's', label: 'seconds', factor: 1 },
    { id: 'minutes', symbol: 'min', label: 'minutes', factor: 60 },
    { id: 'hours', symbol: 'h', label: 'hours', factor: 3600 },
    { id: 'days', symbol: 'd', label: 'days', factor: 86400 },
    { id: 'weeks', symbol: 'wk', label: 'weeks', factor: 604800 },
  ],
  angle: [
    { id: 'degrees', symbol: '°', label: 'degrees', factor: 1 / 360 },
    { id: 'radians', symbol: 'rad', label: 'radians', factor: 1 / (2 * Math.PI) },
    { id: 'gradians', symbol: 'gon', label: 'gradians', factor: 1 / 400 },
    { id: 'turns', symbol: 'turn', label: 'turns', factor: 1 },
  ],
};

export const DEFAULT_CONVERSION_UNIT: Record<UnitDimension, string> = {
  length: 'meter',
  temperature: 'celsius',
  data: 'MiB',
  duration: 'seconds',
  angle: 'degrees',
};

export type NumberParse =
  { state: 'empty' } | { state: 'invalid' } | { state: 'valid'; value: number };

export function parseFiniteNumber(input: string): NumberParse {
  const value = input.trim();
  if (!value) return { state: 'empty' };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return { state: 'invalid' };
  const parsed = Number(value);
  // A nonzero value that underflows to zero must not become a plausible result.
  if (!Number.isFinite(parsed) || (parsed === 0 && /[1-9]/.test(value.split(/[eE]/)[0]))) {
    return { state: 'invalid' };
  }
  return { state: 'valid', value: parsed };
}

export function formatMeasurement(value: number): { text: string; approximate: boolean } {
  if (!Number.isFinite(value)) throw new RangeError('Non-finite measurement');
  const rounded = Number(value.toPrecision(12));
  return {
    text: Object.is(rounded, -0) ? '0' : String(rounded),
    approximate: rounded !== value || (Number.isInteger(value) && !Number.isSafeInteger(value)),
  };
}

function decimalSignature(input: string): string {
  const negative = input.startsWith('-');
  const [mantissa, exponent = '0'] = input.replace(/^[+-]/, '').split(/[eE]/);
  const [integer, fraction = ''] = mantissa.split('.');
  const digits = `${integer}${fraction}`.replace(/^0+/, '');
  if (!digits) return '0';
  const significant = digits.replace(/0+$/, '');
  return `${negative ? '-' : ''}${significant}e${Number(exponent) - fraction.length + digits.length - significant.length}`;
}

export type UnitConversionResult =
  | { state: 'empty' }
  | { state: 'invalid'; reason: 'number' | 'unit' | 'absoluteZero' | 'negativeData' | 'range' }
  | {
      state: 'valid';
      rows: { unit: ConversionUnit; value: number; text: string; approximate: boolean }[];
    };

export function convertUnits(
  input: string,
  dimension: UnitDimension,
  unitId: string
): UnitConversionResult {
  const parsed = parseFiniteNumber(input);
  if (parsed.state === 'empty') return parsed;
  if (parsed.state === 'invalid') return { state: 'invalid', reason: 'number' };
  const units = CONVERSION_UNITS[dimension];
  const source = units.find((unit) => unit.id === unitId);
  if (!source) return { state: 'invalid', reason: 'unit' };
  const inputRounded = decimalSignature(input.trim()) !== decimalSignature(String(parsed.value));
  if (dimension === 'data' && parsed.value < 0) return { state: 'invalid', reason: 'negativeData' };
  if (
    dimension === 'temperature' &&
    parsed.value < ({ celsius: -273.15, fahrenheit: -459.67, kelvin: 0 }[source.id] ?? 0)
  ) {
    return { state: 'invalid', reason: 'absoluteZero' };
  }
  const celsius =
    source.id === 'fahrenheit'
      ? parsed.value === -459.67
        ? -273.15
        : (parsed.value - 32) * (5 / 9)
      : source.id === 'kelvin'
        ? parsed.value - 273.15
        : parsed.value;
  const base = dimension === 'temperature' ? celsius : parsed.value * source.factor;
  if (!Number.isFinite(base) || (base === 0 && parsed.value !== 0 && dimension !== 'temperature')) {
    return { state: 'invalid', reason: 'range' };
  }
  const rows = [];
  for (const unit of units) {
    // The source stays unchanged; other units use a direct ratio to avoid unnecessary overflow.
    const value =
      unit.id === source.id
        ? parsed.value
        : dimension === 'temperature'
          ? unit.id === 'fahrenheit'
            ? celsius * (9 / 5) + 32
            : unit.id === 'kelvin'
              ? celsius + 273.15
              : celsius
          : parsed.value * (source.factor / unit.factor);
    if (
      !Number.isFinite(value) ||
      (value === 0 && parsed.value !== 0 && dimension !== 'temperature')
    ) {
      return { state: 'invalid', reason: 'range' };
    }
    const formatted = formatMeasurement(value);
    rows.push({ unit, value, ...formatted, approximate: formatted.approximate || inputRounded });
  }
  return { state: 'valid', rows };
}

export type TimestampUnit = 'seconds' | 'milliseconds';
export type DateZone = 'utc' | 'local';
export type DateParse = { state: 'empty' } | { state: 'invalid' } | { state: 'valid'; ms: number };
const MAX_DATE_MS = 8_640_000_000_000_000n;
const DAY_MS = 86_400_000;

export function timestampToMilliseconds(input: string, unit: TimestampUnit): DateParse {
  const value = input.trim();
  if (!value) return { state: 'empty' };
  if (!(unit === 'seconds' ? /^[+-]?\d+(?:\.\d{1,3})?$/ : /^[+-]?\d+$/).test(value)) {
    return { state: 'invalid' };
  }
  const negative = value.startsWith('-');
  const [rawInteger, fraction = ''] = value.replace(/^[+-]/, '').split('.');
  const integer = rawInteger.replace(/^0+/, '') || '0';
  if (integer.length > (unit === 'seconds' ? 13 : 16)) return { state: 'invalid' };
  const ms =
    (BigInt(integer) * (unit === 'seconds' ? 1000n : 1n) +
      (unit === 'seconds' ? BigInt(fraction.padEnd(3, '0')) : 0n)) *
    (negative ? -1n : 1n);
  return ms >= -MAX_DATE_MS && ms <= MAX_DATE_MS
    ? { state: 'valid', ms: Number(ms) }
    : { state: 'invalid' };
}

export function formatTimestamp(ms: number, unit: TimestampUnit): string {
  if (!Number.isSafeInteger(ms) || Math.abs(ms) > Number(MAX_DATE_MS))
    throw new RangeError('Invalid timestamp');
  if (unit === 'milliseconds') return String(ms);
  const value = BigInt(ms);
  const magnitude = value < 0n ? -value : value;
  const fraction = String(magnitude % 1000n)
    .padStart(3, '0')
    .replace(/0+$/, '');
  return `${value < 0n ? '-' : ''}${magnitude / 1000n}${fraction ? `.${fraction}` : ''}`;
}

function utcFromParts(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, millisecond);
  return date.getTime();
}

function daysInMonth(year: number, month: number): number {
  return new Date(utcFromParts(year, month + 1, 0)).getUTCDate();
}

export function dateToMilliseconds(input: string, zone: DateZone): DateParse {
  const value = input.trim();
  if (!value) return { state: 'empty' };
  const match = value.match(
    /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?([zZ]|[+-]\d{2}:\d{2}(?::\d{2})?)?)?$/
  );
  if (!match || match[1] === '-000000') return { state: 'invalid' };
  const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '', offset] = match;
  const [y, mo, d, h, mi, s, milli] = [
    year,
    month,
    day,
    hour,
    minute,
    second,
    fraction.padEnd(3, '0'),
  ].map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo) || h > 23 || mi > 59 || s > 59) {
    return { state: 'invalid' };
  }
  let ms: number;
  if (offset && !/^[zZ]$/.test(offset)) {
    const offsetHours = Number(offset.slice(1, 3));
    const offsetMinutes = Number(offset.slice(4, 6));
    const offsetSeconds = offset.length > 6 ? Number(offset.slice(7, 9)) : 0;
    if (offsetHours > 23 || offsetMinutes > 59 || offsetSeconds > 59) {
      return { state: 'invalid' };
    }
    const seconds =
      (offsetHours * 3600 + offsetMinutes * 60 + offsetSeconds) * (offset[0] === '-' ? -1 : 1);
    ms = utcFromParts(y, mo, d, h, mi, s, milli) - seconds * 1000;
  } else if (offset || zone === 'utc') {
    ms = utcFromParts(y, mo, d, h, mi, s, milli);
  } else {
    const date = new Date(0);
    date.setFullYear(y, mo - 1, d);
    date.setHours(h, mi, s, milli);
    ms = date.getTime();
    // Also rejects local times skipped by a daylight-saving transition.
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== mo - 1 ||
      date.getDate() !== d ||
      date.getHours() !== h ||
      date.getMinutes() !== mi ||
      date.getSeconds() !== s ||
      date.getMilliseconds() !== milli
    ) {
      return { state: 'invalid' };
    }
  }
  return Number.isFinite(ms) && Math.abs(ms) <= Number(MAX_DATE_MS)
    ? { state: 'valid', ms }
    : { state: 'invalid' };
}

function formatYear(year: number): string {
  return year >= 0 && year <= 9999
    ? String(year).padStart(4, '0')
    : `${year < 0 ? '-' : '+'}${String(Math.abs(year)).padStart(6, '0')}`;
}

export function formatDateTime(ms: number, zone: DateZone): string {
  const date = new Date(ms);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  const values =
    zone === 'utc'
      ? [
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
          date.getUTCMilliseconds(),
        ]
      : [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds(),
        ];
  const [year, month, day, hour, minute, second, milli] = values;
  // Historical zones can have second-level offsets, which getTimezoneOffset truncates.
  const localAsUtc = utcFromParts(year, month, day, hour, minute, second, milli);
  const offset = Number.isFinite(localAsUtc)
    ? Math.round((localAsUtc - ms) / 1000)
    : -date.getTimezoneOffset() * 60;
  const offsetSeconds = Math.abs(offset) % 60;
  const suffix =
    zone === 'utc'
      ? 'Z'
      : `${offset < 0 ? '-' : '+'}${String(Math.floor(Math.abs(offset) / 3600)).padStart(2, '0')}:${String(Math.floor(Math.abs(offset) / 60) % 60).padStart(2, '0')}${offsetSeconds ? `:${String(offsetSeconds).padStart(2, '0')}` : ''}`;
  return `${formatYear(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${String(milli).padStart(3, '0')}${suffix}`;
}

export type WeekendPattern = 'saturdaySunday' | 'fridaySaturday' | 'sunday';
const WEEKEND_DAYS: Record<WeekendPattern, readonly number[]> = {
  saturdaySunday: [0, 6],
  fridaySaturday: [5, 6],
  sunday: [0],
};
export type DateDifferenceResult =
  | { state: 'empty' }
  | { state: 'invalid'; reason: 'date' | 'order' | 'holiday' }
  | {
      state: 'valid';
      years: number;
      months: number;
      days: number;
      totalMonths: number;
      elapsedDays: number;
      rangeDays: number;
      businessDays: number;
      weekendDays: number;
      excludedHolidays: number;
    };

function parseCalendarDate(input: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const parsed = dateToMilliseconds(input, 'utc');
  return parsed.state === 'valid' ? parsed.ms : null;
}

function addCalendarMonths(ms: number, months: number): number {
  const date = new Date(ms);
  const total = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(total / 12);
  const month = (((total % 12) + 12) % 12) + 1;
  return utcFromParts(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month)));
}

export function calculateDateDifference(
  startInput: string,
  endInput: string,
  options: {
    includeEnd?: boolean;
    holidays?: string;
    weekend?: WeekendPattern;
  } = {}
): DateDifferenceResult {
  const startValue = startInput.trim();
  const endValue = endInput.trim();
  if (!startValue || !endValue) return { state: 'empty' };
  const start = parseCalendarDate(startValue);
  const end = parseCalendarDate(endValue);
  if (start === null || end === null) return { state: 'invalid', reason: 'date' };
  if (end < start) return { state: 'invalid', reason: 'order' };
  const holidays = new Set<number>();
  for (const input of (options.holidays ?? '').split(/[\s,;]+/).filter(Boolean)) {
    const holiday = parseCalendarDate(input);
    if (holiday === null) return { state: 'invalid', reason: 'holiday' };
    holidays.add(holiday);
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  let totalMonths =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    endDate.getUTCMonth() -
    startDate.getUTCMonth();
  if (addCalendarMonths(start, totalMonths) > end) totalMonths -= 1;
  const elapsedDays = (end - start) / DAY_MS;
  const rangeDays = elapsedDays + (options.includeEnd ? 1 : 0);
  const weekend = WEEKEND_DAYS[options.weekend ?? 'saturdaySunday'];
  // Count complete weeks arithmetically; only the remaining six days need iteration.
  let weekendDays = Math.floor(rangeDays / 7) * weekend.length;
  for (let index = 0; index < rangeDays % 7; index += 1) {
    if (weekend.includes((startDate.getUTCDay() + index) % 7)) weekendDays += 1;
  }
  const rangeEnd = end + (options.includeEnd ? DAY_MS : 0);
  let excludedHolidays = 0;
  for (const holiday of holidays) {
    if (holiday >= start && holiday < rangeEnd && !weekend.includes(new Date(holiday).getUTCDay()))
      excludedHolidays += 1;
  }
  return {
    state: 'valid',
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: (end - addCalendarMonths(start, totalMonths)) / DAY_MS,
    totalMonths,
    elapsedDays,
    rangeDays,
    businessDays: rangeDays - weekendDays - excludedHolidays,
    weekendDays,
    excludedHolidays,
  };
}
