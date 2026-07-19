import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Zone = 'local' | 'utc' | 'asia-shanghai';
type Unit = 'seconds' | 'milliseconds';
type Result = { ok: true; ms: number } | { ok: false } | { ok: null };

const ZONES: { value: Zone; label: MessageKey }[] = [
  { value: 'local', label: 'tools.timestamp.zoneLocal' },
  { value: 'utc', label: 'tools.timestamp.zoneUtc' },
  { value: 'asia-shanghai', label: 'tools.timestamp.zoneShanghai' },
];

const UNITS: { value: Unit; label: MessageKey }[] = [
  { value: 'seconds', label: 'tools.timestamp.seconds' },
  { value: 'milliseconds', label: 'tools.timestamp.milliseconds' },
];

function timeZone(zone: Zone): string | undefined {
  if (zone === 'utc') return 'UTC';
  if (zone === 'asia-shanghai') return 'Asia/Shanghai';
  return undefined;
}

function formatDate(ms: number, zone: Zone): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone(zone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

function timestampToMs(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: null };
  if (!/^-?\d+$/.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false };
  const ms = trimmed.replace('-', '').length > 10 ? value : value * 1000;
  return Number.isNaN(new Date(ms).getTime()) ? { ok: false } : { ok: true, ms };
}

function dateToMs(input: string, zone: Zone): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: null };

  // Respect an explicit offset or Z suffix regardless of the selected display zone.
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const ms = Date.parse(trimmed);
    return Number.isNaN(ms) ? { ok: false } : { ok: true, ms };
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return { ok: false };
  const [, year, month, day, hour, minute, second = '0'] = match;
  const parts = [year, month, day, hour, minute, second].map(Number);
  const [y, mo, d, h, mi, s] = parts;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) {
    return { ok: false };
  }

  let ms: number;
  if (zone === 'local') {
    ms = new Date(y, mo - 1, d, h, mi, s).getTime();
  } else {
    const offsetHours = zone === 'asia-shanghai' ? 8 : 0;
    ms = Date.UTC(y, mo - 1, d, h - offsetHours, mi, s);
  }
  if (
    Number.isNaN(ms) ||
    formatDate(ms, zone) !== `${year}-${month}-${day} ${hour}:${minute}:${second}`
  ) {
    return { ok: false };
  }
  return { ok: true, ms };
}

export default function Timestamp() {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  const [zone, setZone] = useState<Zone>('local');
  const [unit, setUnit] = useState<Unit>('seconds');
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tsResult = useMemo(() => timestampToMs(tsInput), [tsInput]);
  const dateResult = useMemo(() => dateToMs(dateInput, zone), [dateInput, zone]);
  const tsOutput = tsResult.ok === true ? formatDate(tsResult.ms, zone) : '';
  const dateOutput =
    dateResult.ok === true
      ? String(unit === 'seconds' ? Math.floor(dateResult.ms / 1000) : dateResult.ms)
      : '';
  const nowSeconds = String(Math.floor(now / 1000));

  return (
    <ToolLayout
      title={t('tools.timestamp.name')}
      description={t('tools.timestamp.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.toolbar}>
        <div className={styles.optionGroup} role="group" aria-label={t('tools.timestamp.timeZone')}>
          <span className={styles.optionLabel}>{t('tools.timestamp.timeZone')}</span>
          <div className={styles.options}>
            {ZONES.map((item) => (
              <Button
                key={item.value}
                size="sm"
                active={zone === item.value}
                onClick={() => setZone(item.value)}
                aria-pressed={zone === item.value}
              >
                {t(item.label)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.current}>
        <div className={styles.currentHead}>
          <span className={styles.currentLabel}>{t('tools.timestamp.currentLabel')}</span>
          <CopyButton
            value={nowSeconds}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
        <span className={styles.currentValue}>{nowSeconds}</span>
        <span className={styles.currentDate}>{formatDate(now, zone)}</span>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel} htmlFor="timestamp-input">
            {t('tools.timestamp.tsInputLabel')}
          </label>
          <Button size="sm" variant="ghost" onClick={() => setTsInput(nowSeconds)}>
            {t('tools.timestamp.useNow')}
          </Button>
        </div>
        <TextArea
          id="timestamp-input"
          value={tsInput}
          onChange={(event) => setTsInput(event.target.value)}
          invalid={tsResult.ok === false}
          aria-describedby={tsResult.ok === false ? 'timestamp-input-error' : undefined}
          placeholder={t('tools.timestamp.tsPlaceholder')}
        />
        {tsResult.ok === false && (
          <p id="timestamp-input-error" className={styles.error} role="alert">
            {t('tools.timestamp.invalidTs')}
          </p>
        )}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel} htmlFor="timestamp-date-output">
            {t('tools.timestamp.tsOutputLabel')}
          </label>
          <CopyButton value={tsOutput} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea id="timestamp-date-output" value={tsOutput} readOnly />
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel} htmlFor="timestamp-date-input">
            {t('tools.timestamp.dateInputLabel')}
          </label>
          <Button size="sm" variant="ghost" onClick={() => setDateInput(formatDate(now, zone))}>
            {t('tools.timestamp.useNow')}
          </Button>
        </div>
        <TextArea
          id="timestamp-date-input"
          value={dateInput}
          onChange={(event) => setDateInput(event.target.value)}
          invalid={dateResult.ok === false}
          aria-describedby={dateResult.ok === false ? 'timestamp-date-error' : undefined}
          placeholder={t('tools.timestamp.datePlaceholder')}
        />
        {dateResult.ok === false && (
          <p id="timestamp-date-error" className={styles.error} role="alert">
            {t('tools.timestamp.invalidDate')}
          </p>
        )}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <div className={styles.outputLabelGroup}>
            <label className={styles.paneLabel} htmlFor="timestamp-value-output">
              {t('tools.timestamp.dateOutputLabel')}
            </label>
            <div
              className={styles.options}
              role="group"
              aria-label={t('tools.timestamp.outputUnit')}
            >
              {UNITS.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  active={unit === item.value}
                  onClick={() => setUnit(item.value)}
                  aria-pressed={unit === item.value}
                >
                  {t(item.label)}
                </Button>
              ))}
            </div>
          </div>
          <CopyButton
            value={dateOutput}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
        <TextArea id="timestamp-value-output" value={dateOutput} readOnly />
      </div>
    </ToolLayout>
  );
}
