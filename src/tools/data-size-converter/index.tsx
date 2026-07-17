import { useMemo, useState } from 'react';
import clsx from 'clsx';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
type Unit = (typeof UNITS)[number];

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function factor(unit: Unit): number {
  return 1024 ** UNITS.indexOf(unit);
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) {
    return '';
  }
  if (Number.isInteger(n)) {
    return n.toString();
  }
  return Number(n.toPrecision(12)).toString();
}

type Parsed = { state: 'empty' } | { state: 'invalid' } | { state: 'ok'; bytes: number };

function parse(value: string, unit: Unit): Parsed {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { state: 'empty' };
  }
  if (!NUMBER.test(trimmed)) {
    return { state: 'invalid' };
  }
  return { state: 'ok', bytes: parseFloat(trimmed) * factor(unit) };
}

export default function DataSizeConverter() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<Unit>('MB');

  const parsed = useMemo(() => parse(value, unit), [value, unit]);
  const bytes = parsed.state === 'ok' ? parsed.bytes : null;

  return (
    <ToolLayout
      title={t('tools.dataSizeConverter.name')}
      description={t('tools.dataSizeConverter.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="data-size-value">
          {t('tools.dataSizeConverter.valueLabel')}
        </label>
        <input
          id="data-size-value"
          type="text"
          inputMode="decimal"
          className={clsx(styles.input, parsed.state === 'invalid' && styles.invalid)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('tools.dataSizeConverter.placeholder')}
          aria-label={t('tools.dataSizeConverter.valueLabel')}
        />
      </div>

      <div className={styles.units}>
        {UNITS.map((u) => (
          <Button key={u} size="sm" active={unit === u} onClick={() => setUnit(u)}>
            {u}
          </Button>
        ))}
      </div>

      {parsed.state === 'invalid' && (
        <p className={styles.error}>{t('tools.dataSizeConverter.invalid')}</p>
      )}

      <div className={styles.results}>
        {UNITS.map((u) => {
          const out = bytes !== null ? fmt(bytes / factor(u)) : '';
          return (
            <div key={u} className={styles.row}>
              <span className={styles.rowLabel}>{u}</span>
              <code className={styles.rowValue} data-empty={bytes === null}>
                {bytes !== null ? out : '—'}
              </code>
              <CopyButton
                value={out}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
                disabled={bytes === null}
              />
            </div>
          );
        })}
      </div>
    </ToolLayout>
  );
}
