import { Alert, TextField, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';

import ToolLayout from '@/components/ToolLayout';
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
      <TextField
        wrapperClassName={styles.field}
        label={t('tools.dataSizeConverter.valueLabel')}
        id="data-size-value"
        type="text"
        inputMode="decimal"
        invalid={parsed.state === 'invalid'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('tools.dataSizeConverter.placeholder')}
        aria-label={t('tools.dataSizeConverter.valueLabel')}
      />

      <div className={styles.controls}>
        <Segmented<typeof system>
          value={system}
          onChange={changeSystem}
          items={[
            { value: 'binary', label: t('tools.dataSizeConverter.binary') },
            { value: 'decimal', label: t('tools.dataSizeConverter.decimal') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={360}
          ariaLabel={t('tools.dataSizeConverter.system')}
        />
        <Segmented<typeof unit>
          value={unit}
          onChange={setUnit}
          items={unitsFor(system).map((u) => ({ value: u, label: String(u) }))}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('tools.dataSizeConverter.unit')}
        />
      </div>

      {parsed.state === 'invalid' && (
        <Alert variant="danger">{t('tools.dataSizeConverter.invalid')}</Alert>
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
