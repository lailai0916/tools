import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Card from '@/components/Card';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Kind = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';
type Spec = { min: number; max: number };

const SPECS: Record<Kind, Spec> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 },
};

const KINDS: Kind[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

function splitStep(term: string): [string, string | null] {
  const parts = term.split('/');
  if (parts.length === 1) return [parts[0], null];
  if (parts.length === 2) return [parts[0], parts[1]];
  return ['', '__bad__'];
}

function validateTerm(term: string, spec: Spec): boolean {
  const [range, step] = splitStep(term);
  if (step === '__bad__') return false;
  if (step !== null && (!/^\d+$/.test(step) || Number(step) === 0)) return false;
  if (range === '*') return true;
  const dash = range.split('-');
  if (dash.length === 1) {
    if (!/^\d+$/.test(range)) return false;
    const n = Number(range);
    return n >= spec.min && n <= spec.max;
  }
  if (dash.length === 2) {
    if (!/^\d+$/.test(dash[0]) || !/^\d+$/.test(dash[1])) return false;
    const a = Number(dash[0]);
    const b = Number(dash[1]);
    return a >= spec.min && b <= spec.max && a <= b;
  }
  return false;
}

function validateField(field: string, spec: Spec): boolean {
  if (field === '') return false;
  return field.split(',').every((term) => validateTerm(term, spec));
}

const NOUNS: Record<Locale, Record<Kind, string>> = {
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

const WEEKDAYS: Record<Locale, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'zh-Hans': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
};

const MONTHS: Record<Locale, string[]> = {
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

function asNumberList(field: string): number[] | null {
  const parts = field.split(',');
  const nums: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    nums.push(Number(p));
  }
  return nums;
}

function isStar(f: string): boolean {
  return f === '*';
}

function everyStep(f: string): number | null {
  const m = f.match(/^\*\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function describeTerm(term: string, locale: Locale): string {
  const zh = locale === 'zh-Hans';
  const [range, step] = splitStep(term);
  if (step !== null) {
    if (range === '*') return zh ? `每 ${step}` : `every ${step}`;
    const dash = range.split('-');
    if (dash.length === 2)
      return zh ? `${dash[0]}–${dash[1]}（步长 ${step}）` : `${dash[0]}–${dash[1]} step ${step}`;
    return zh ? `自 ${range} 起每 ${step}` : `every ${step} from ${range}`;
  }
  if (range.includes('-')) {
    const dash = range.split('-');
    return `${dash[0]}–${dash[1]}`;
  }
  return range;
}

function describeField(field: string, kind: Kind, locale: Locale): string {
  const zh = locale === 'zh-Hans';
  if (isStar(field)) return zh ? `每${NOUNS[locale][kind]}` : `Every ${NOUNS[locale][kind]}`;
  return field
    .split(',')
    .map((term) => describeTerm(term, locale))
    .join(zh ? '、' : ', ');
}

function weekdayList(field: string, locale: Locale): string {
  const nums = asNumberList(field);
  if (nums)
    return nums.map((n) => WEEKDAYS[locale][n % 7]).join(locale === 'zh-Hans' ? '、' : ', ');
  return describeField(field, 'dayOfWeek', locale);
}

function monthList(field: string, locale: Locale): string {
  const nums = asNumberList(field);
  if (nums) return nums.map((n) => MONTHS[locale][n - 1]).join(locale === 'zh-Hans' ? '、' : ', ');
  return describeField(field, 'month', locale);
}

function domList(field: string, locale: Locale): string {
  const nums = asNumberList(field);
  if (nums) return nums.join(locale === 'zh-Hans' ? '、' : ', ');
  return describeField(field, 'dayOfMonth', locale);
}

function describeDayScope(dom: string, month: string, dow: string, locale: Locale): string {
  const zh = locale === 'zh-Hans';
  let dayPart: string;
  if (isStar(dom) && isStar(dow)) dayPart = zh ? '每天' : 'every day';
  else if (isStar(dom) && !isStar(dow))
    dayPart = zh ? `每${weekdayList(dow, locale)}` : `on ${weekdayList(dow, locale)}`;
  else if (!isStar(dom) && isStar(dow))
    dayPart = zh
      ? `每月 ${domList(dom, locale)} 日`
      : `on day ${domList(dom, locale)} of the month`;
  else
    dayPart = zh
      ? `每月 ${domList(dom, locale)} 日及每${weekdayList(dow, locale)}`
      : `on day ${domList(dom, locale)} and ${weekdayList(dow, locale)}`;

  if (isStar(month)) return dayPart;
  return zh
    ? `${monthList(month, locale)}的${dayPart}`
    : `${dayPart} in ${monthList(month, locale)}`;
}

function summarize(fields: Record<Kind, string>, locale: Locale): string {
  const zh = locale === 'zh-Hans';
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;

  if (KINDS.every((k) => isStar(fields[k]))) return zh ? '每分钟执行一次。' : 'Runs every minute.';

  const step = everyStep(minute);
  if (step && isStar(hour) && isStar(dayOfMonth) && isStar(month) && isStar(dayOfWeek)) {
    return zh ? `每 ${step} 分钟执行一次。` : `Runs every ${step} minutes.`;
  }

  const scope = describeDayScope(dayOfMonth, month, dayOfWeek, locale);

  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const time = `${pad(Number(hour))}:${pad(Number(minute))}`;
    return zh ? `${scope} ${time} 执行。` : `Runs at ${time} ${scope}.`;
  }
  if (isStar(minute) && /^\d+$/.test(hour)) {
    return zh
      ? `${scope} ${pad(Number(hour))} 点内每分钟执行。`
      : `Runs every minute past ${pad(Number(hour))}:00 ${scope}.`;
  }
  if (/^\d+$/.test(minute) && isStar(hour)) {
    return zh
      ? `${scope}每小时第 ${Number(minute)} 分钟执行。`
      : `Runs at minute ${Number(minute)} of every hour ${scope}.`;
  }

  const mm = describeField(minute, 'minute', locale);
  const hh = describeField(hour, 'hour', locale);
  return zh
    ? `${scope}，小时 ${hh}、分钟 ${mm} 执行。`
    : `Runs at minute [${mm}], hour [${hh}] ${scope}.`;
}

type Parsed =
  { ok: true; summary: string; fields: Record<Kind, string> } | { ok: false } | { ok: null };

function parse(expr: string, locale: Locale): Parsed {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) return { ok: false };
  const fields = {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  } as Record<Kind, string>;
  for (const kind of KINDS) {
    if (!validateField(fields[kind], SPECS[kind])) return { ok: false };
  }
  return { ok: true, summary: summarize(fields, locale), fields };
}

export default function CrontabParser() {
  const { t, locale } = useI18n();
  const [expr, setExpr] = useState('*/5 9-17 * * 1-5');

  const parsed = useMemo(() => parse(expr, locale), [expr, locale]);

  return (
    <ToolLayout
      title={t('tools.crontabParser.name')}
      description={t('tools.crontabParser.description')}
      backLabel={t('common.back')}
    >
      <TextArea
        className={styles.expr}
        rows={1}
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        invalid={parsed.ok === false}
        placeholder={t('tools.crontabParser.placeholder')}
        aria-label={t('tools.crontabParser.name')}
      />

      {parsed.ok === false && <p className={styles.error}>{t('tools.crontabParser.invalid')}</p>}

      {parsed.ok === true && (
        <>
          <Card className={styles.summary}>
            <span className={styles.summaryLabel}>{t('tools.crontabParser.summary')}</span>
            <p className={styles.summaryText}>{parsed.summary}</p>
          </Card>

          <div className={styles.results}>
            {KINDS.map((kind) => (
              <div className={styles.row} key={kind}>
                <span className={styles.rowLabel}>
                  {t(`tools.crontabParser.${kind}` as MessageKey)}
                </span>
                <code className={styles.rowField}>{parsed.fields[kind]}</code>
                <span className={styles.rowValue}>
                  {describeField(parsed.fields[kind], kind, locale)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
