import { useMemo, useState } from 'react';
import clsx from 'clsx';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type System = 'decimal' | 'binary';
const UNITS = {
  decimal: ['B', 'kB', 'MB', 'GB', 'TB'],
  binary: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
} as const;
type Unit = (typeof UNITS)[System][number];

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function unitsFor(system: System): readonly Unit[] {
  return UNITS[system];
}

function factor(unit: Unit, system: System): number {
  return (system === 'binary' ? 1024 : 1000) ** unitsFor(system).indexOf(unit);
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

function parse(value: string, unit: Unit, system: System): Parsed {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { state: 'empty' };
  }
  if (!NUMBER.test(trimmed)) {
    return { state: 'invalid' };
  }
  const bytes = parseFloat(trimmed) * factor(unit, system);
  return Number.isFinite(bytes) && bytes >= 0 ? { state: 'ok', bytes } : { state: 'invalid' };
}

export default function DataSizeConverter() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [system, setSystem] = useState<System>('binary');
  const [unit, setUnit] = useState<Unit>('MiB');

  const parsed = useMemo(() => parse(value, unit, system), [value, unit, system]);
  const bytes = parsed.state === 'ok' ? parsed.bytes : null;

  const changeSystem = (next: System) => {
    const index = unitsFor(system).indexOf(unit);
    setSystem(next);
    setUnit(unitsFor(next)[index]);
  };

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

      <div className={styles.controls}>
        <div
          className={styles.systems}
          role="group"
          aria-label={t('tools.dataSizeConverter.system')}
        >
          <Button
            size="sm"
            active={system === 'binary'}
            onClick={() => changeSystem('binary')}
            aria-pressed={system === 'binary'}
          >
            {t('tools.dataSizeConverter.binary')}
          </Button>
          <Button
            size="sm"
            active={system === 'decimal'}
            onClick={() => changeSystem('decimal')}
            aria-pressed={system === 'decimal'}
          >
            {t('tools.dataSizeConverter.decimal')}
          </Button>
        </div>
        <div className={styles.units} role="group" aria-label={t('tools.dataSizeConverter.unit')}>
          {unitsFor(system).map((u) => (
            <Button key={u} size="sm" active={unit === u} onClick={() => setUnit(u)}>
              {u}
            </Button>
          ))}
        </div>
      </div>

      {parsed.state === 'invalid' && (
        <p className={styles.error}>{t('tools.dataSizeConverter.invalid')}</p>
      )}

      <div className={styles.results}>
        {unitsFor(system).map((u) => {
          const out = bytes !== null ? fmt(bytes / factor(u, system)) : '';
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
