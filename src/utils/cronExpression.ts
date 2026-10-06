import type { Locale } from '@/i18n';

export type CronKind = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export const CRON_KINDS: readonly CronKind[] = [
  'minute',
  'hour',
  'dayOfMonth',
  'month',
  'dayOfWeek',
];

type Spec = { min: number; max: number };
const SPECS: Record<CronKind, Spec> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 },
};

const NOUNS: Record<Locale, Record<CronKind, string>> = {
  en: {
    minute: 'minute',
    hour: 'hour',
    dayOfMonth: 'day of month',
    month: 'month',
    dayOfWeek: 'day of week',
  },
  'zh-Hans': {
    minute: '分钟',
    hour: '小时',
    dayOfMonth: '日',
    month: '月',
    dayOfWeek: '星期',
  },
};

const WEEKDAYS: Record<Locale, readonly string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'zh-Hans': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
};

const MONTHS: Record<Locale, readonly string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  'zh-Hans': [
    '1 月',
    '2 月',
    '3 月',
    '4 月',
    '5 月',
    '6 月',
    '7 月',
    '8 月',
    '9 月',
    '10 月',
    '11 月',
    '12 月',
  ],
};

function expandField(field: string, kind: CronKind): number[] | null {
  const { min, max } = SPECS[kind];
  const values = new Set<number>();
  for (const term of field.split(',')) {
    // Numeric steps apply only to a wildcard or an explicit range in Unix cron.
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(term);
    if (!match) return null;
    const [, range, stepText] = match;
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isSafeInteger(step) || step <= 0) return null;
    if (stepText !== undefined && range !== '*' && !range.includes('-')) return null;
    const endpoints = range === '*' ? [min, max] : range.split('-').map(Number);
    const start = endpoints[0];
    const end = endpoints[1] ?? start;
    if (start < min || end > max || start > end) return null;
    for (let value = start; value <= end; value += step) {
      values.add(kind === 'dayOfWeek' ? value % 7 : value);
    }
  }
  return [...values].sort((a, b) => a - b);
}

function coversField(values: readonly number[], kind: CronKind): boolean {
  const { min, max } = SPECS[kind];
  return values.length === (kind === 'dayOfWeek' ? 7 : max - min + 1);
}

function numberList(values: readonly number[], locale: Locale): string {
  const terms: string[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const start = values[index];
    let end = start;
    while (values[index + 1] === end + 1) {
      index += 1;
      end = values[index];
    }
    if (end - start >= 2) terms.push(`${start}–${end}`);
    else {
      terms.push(String(start));
      if (end !== start) terms.push(String(end));
    }
  }
  return terms.join(locale === 'zh-Hans' ? '、' : ', ');
}

function weekdayList(values: readonly number[], locale: Locale): string {
  return values.map((value) => WEEKDAYS[locale][value]).join(locale === 'zh-Hans' ? '、' : ', ');
}

function monthList(values: readonly number[], locale: Locale): string {
  return values.map((value) => MONTHS[locale][value - 1]).join(locale === 'zh-Hans' ? '、' : ', ');
}

function describeField(values: readonly number[], kind: CronKind, locale: Locale): string {
  if (coversField(values, kind)) {
    return locale === 'zh-Hans' ? `每${NOUNS[locale][kind]}` : `Every ${NOUNS[locale][kind]}`;
  }
  if (kind === 'dayOfWeek') return weekdayList(values, locale);
  if (kind === 'month') return monthList(values, locale);
  return numberList(values, locale);
}

type CronValues = Record<CronKind, number[]>;

function describeDayScope(values: CronValues, dayMatch: 'and' | 'or', locale: Locale): string {
  const zh = locale === 'zh-Hans';
  const domAll = coversField(values.dayOfMonth, 'dayOfMonth');
  const dowAll = coversField(values.dayOfWeek, 'dayOfWeek');
  const dom = numberList(values.dayOfMonth, locale);
  const dow = weekdayList(values.dayOfWeek, locale);
  let dayPart: string;
  if ((dayMatch === 'or' && (domAll || dowAll)) || (domAll && dowAll)) {
    dayPart = zh ? '每天' : 'every day';
  } else if (domAll) {
    dayPart = zh ? `每${dow}` : `on ${dow}`;
  } else if (dowAll) {
    dayPart = zh ? `每月 ${dom} 日` : `on day ${dom} of the month`;
  } else {
    dayPart = zh
      ? dayMatch === 'and'
        ? `每月 ${dom} 日且为${dow}时`
        : `每月 ${dom} 日或每${dow}`
      : `on day ${dom} of the month ${dayMatch} ${dow}`;
  }
  if (coversField(values.month, 'month')) return dayPart;
  const months = monthList(values.month, locale);
  return zh ? `${months}的${dayPart}` : `${dayPart} in ${months}`;
}

function summarize(values: CronValues, dayMatch: 'and' | 'or', locale: Locale): string {
  const zh = locale === 'zh-Hans';
  const scope = describeDayScope(values, dayMatch, locale);
  const minuteAll = coversField(values.minute, 'minute');
  const hourAll = coversField(values.hour, 'hour');
  const everyDay = scope === (zh ? '每天' : 'every day');
  if (minuteAll && hourAll) {
    if (everyDay) return zh ? '每分钟执行一次。' : 'Runs every minute.';
    return zh ? `${scope}每分钟执行一次。` : `Runs every minute ${scope}.`;
  }
  if (values.minute.length === 1 && values.hour.length === 1) {
    const time = `${String(values.hour[0]).padStart(2, '0')}:${String(values.minute[0]).padStart(2, '0')}`;
    return zh ? `${scope} ${time} 执行。` : `Runs at ${time} ${scope}.`;
  }
  if (minuteAll && values.hour.length === 1) {
    const hour = String(values.hour[0]).padStart(2, '0');
    return zh
      ? `${scope} ${hour} 点内每分钟执行。`
      : `Runs every minute during hour ${hour} ${scope}.`;
  }
  const minutes = numberList(values.minute, locale);
  if (hourAll) {
    if (everyDay) {
      return zh ? `每小时第 ${minutes} 分钟执行。` : `Runs at minute ${minutes} of every hour.`;
    }
    return zh
      ? `${scope}每小时第 ${minutes} 分钟执行。`
      : `Runs at minute ${minutes} of every hour ${scope}.`;
  }
  const hours = numberList(values.hour, locale);
  return zh
    ? `${scope}，小时 ${hours}、分钟 ${minutes} 执行。`
    : `Runs at minute [${minutes}], hour [${hours}] ${scope}.`;
}

export type ParsedCronExpression =
  | {
      ok: true;
      summary: string;
      fields: Record<CronKind, string>;
      values: CronValues;
      descriptions: Record<CronKind, string>;
      dayMatch: 'and' | 'or';
    }
  | { ok: false }
  | { ok: null };

export function parseCronExpression(expr: string, locale: Locale): ParsedCronExpression {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) return { ok: false };
  const fields = Object.fromEntries(
    CRON_KINDS.map((kind, index) => [kind, parts[index]])
  ) as Record<CronKind, string>;
  const values = {} as CronValues;
  const descriptions = {} as Record<CronKind, string>;
  for (const kind of CRON_KINDS) {
    const expanded = expandField(fields[kind], kind);
    if (!expanded) return { ok: false };
    values[kind] = expanded;
    descriptions[kind] = describeField(expanded, kind, locale);
  }
  // Cronie records DOM_STAR/DOW_STAR from the first character, including */n.
  const dayMatch =
    fields.dayOfMonth.startsWith('*') || fields.dayOfWeek.startsWith('*') ? 'and' : 'or';
  return {
    ok: true,
    summary: summarize(values, dayMatch, locale),
    fields,
    values,
    descriptions,
    dayMatch,
  };
}
