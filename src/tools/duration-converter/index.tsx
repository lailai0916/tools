import { useMemo, useState } from 'react';
import clsx from 'clsx';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Unit = 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

const UNITS: { key: Unit; labelKey: MessageKey; ms: number }[] = [
  { key: 'ms', labelKey: 'tools.durationConverter.ms', ms: 1 },
  { key: 'seconds', labelKey: 'tools.durationConverter.seconds', ms: 1000 },
  { key: 'minutes', labelKey: 'tools.durationConverter.minutes', ms: 60_000 },
  { key: 'hours', labelKey: 'tools.durationConverter.hours', ms: 3_600_000 },
  { key: 'days', labelKey: 'tools.durationConverter.days', ms: 86_400_000 },
  { key: 'weeks', labelKey: 'tools.durationConverter.weeks', ms: 604_800_000 },
];

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function fmt(n: number): string {
  if (!Number.isFinite(n)) {
    return '';
  }
  if (Number.isInteger(n)) {
    return n.toString();
  }
  return Number(n.toPrecision(12)).toString();
}

type Parsed = { state: 'empty' } | { state: 'invalid' } | { state: 'ok'; ms: number };

function parse(value: string, unit: Unit): Parsed {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { state: 'empty' };
  }
  if (!NUMBER.test(trimmed)) {
    return { state: 'invalid' };
  }
  const factor = UNITS.find((u) => u.key === unit)?.ms ?? 1;
  return { state: 'ok', ms: parseFloat(trimmed) * factor };
}

export default function DurationConverter() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<Unit>('seconds');

  const parsed = useMemo(() => parse(value, unit), [value, unit]);
  const totalMs = parsed.state === 'ok' ? parsed.ms : null;

  return (
    <ToolLayout
      title={t('tools.durationConverter.name')}
      description={t('tools.durationConverter.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="duration-value">
          {t('tools.durationConverter.valueLabel')}
        </label>
        <input
          id="duration-value"
          type="text"
          inputMode="decimal"
          className={clsx(styles.input, parsed.state === 'invalid' && styles.invalid)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('tools.durationConverter.placeholder')}
          aria-label={t('tools.durationConverter.valueLabel')}
        />
      </div>

      <div className={styles.units}>
        {UNITS.map((u) => (
          <Button key={u.key} size="sm" active={unit === u.key} onClick={() => setUnit(u.key)}>
            {t(u.labelKey)}
          </Button>
        ))}
      </div>

      {parsed.state === 'invalid' && (
        <p className={styles.error}>{t('tools.durationConverter.invalid')}</p>
      )}

      <div className={styles.results}>
        {UNITS.map((u) => {
          const out = totalMs !== null ? fmt(totalMs / u.ms) : '';
          return (
            <div key={u.key} className={styles.row}>
              <span className={styles.rowLabel}>{t(u.labelKey)}</span>
              <code className={styles.rowValue} data-empty={totalMs === null}>
                {totalMs !== null ? out : '—'}
              </code>
              <CopyButton
                value={out}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
                disabled={totalMs === null}
              />
            </div>
          );
        })}
      </div>
    </ToolLayout>
  );
}
