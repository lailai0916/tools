import { Alert, Button, Segmented, DropdownSelectField, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane, ToolResults } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  CONVERSION_UNITS,
  DEFAULT_CONVERSION_UNIT,
  convertUnits,
  type ConversionUnit,
  type UnitDimension,
} from '@/utils/curatedTimeUnits';
import styles from './styles.module.css';

const DIMENSIONS: UnitDimension[] = ['length', 'temperature', 'data', 'duration', 'angle'];

export default function UnitConverter() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const dimension = DIMENSIONS.find((value) => value === params.get('dimension')) ?? 'length';
  const units = CONVERSION_UNITS[dimension];
  const unit =
    units.find((value) => value.id === params.get('unit'))?.id ??
    DEFAULT_CONVERSION_UNIT[dimension];
  const [input, setInput] = useState('');
  const result = useMemo(() => convertUnits(input, dimension, unit), [input, dimension, unit]);
  const label = (value: ConversionUnit) => {
    const name = ['kB', 'MB', 'GB', 'TB', 'PB', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'].includes(
      value.id
    )
      ? value.symbol
      : `${t(`tools.unitConverter.unit.${value.label}` as MessageKey)} (${value.symbol})`;
    return value.system
      ? `${name} · ${t(value.system === 'si' ? 'tools.unitConverter.si' : 'tools.unitConverter.iec')}`
      : name;
  };
  const update = (nextDimension: UnitDimension, nextUnit: string) => {
    const next = new URLSearchParams(params);
    next.set('dimension', nextDimension);
    next.set('unit', nextUnit);
    setParams(next, { replace: true });
  };

  return (
    <ToolLayout
      title={t('tools.unitConverter.name')}
      description={t('tools.unitConverter.description')}
    >
      <Segmented<UnitDimension>
        value={dimension}
        onChange={(value) => update(value, DEFAULT_CONVERSION_UNIT[value])}
        items={DIMENSIONS.map((value) => ({
          value,
          label: t(`tools.unitConverter.dimension.${value}` as MessageKey),
        }))}
        size="sm"
        orientation="horizontal"
        stackAt={480}
        className={styles.dimensions}
        ariaLabel={t('tools.unitConverter.dimension')}
      />
      <ToolGrid>
        <ToolPane
          title={t('common.input')}
          actions={
            <Button size="sm" variant="ghost" disabled={!input} onClick={() => setInput('')}>
              {t('common.clear')}
            </Button>
          }
        >
          <div className={styles.fields}>
            <TextField
              id="unit-converter-value"
              label={t('tools.unitConverter.value')}
              type="text"
              inputMode="decimal"
              monospace
              spellCheck={false}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="1"
              invalid={result.state === 'invalid'}
              aria-describedby={result.state === 'invalid' ? 'unit-converter-error' : undefined}
            />
            <DropdownSelectField
              label={t('tools.unitConverter.sourceUnit')}
              value={unit}
              onValueChange={(value) => update(dimension, value)}
              options={units.map((value) => ({ value: value.id, label: label(value) }))}
            />
          </div>
          {result.state === 'invalid' && (
            <Alert id="unit-converter-error" variant="danger" role="alert">
              {t(`tools.unitConverter.error.${result.reason}` as MessageKey)}
            </Alert>
          )}
          {dimension === 'data' && (
            <p className={styles.note}>{t('tools.unitConverter.dataNote')}</p>
          )}
          {dimension === 'duration' && (
            <p className={styles.note}>{t('tools.unitConverter.durationNote')}</p>
          )}
          <p className={styles.note}>{t('tools.unitConverter.precision')}</p>
        </ToolPane>
        <ToolPane title={t('tools.unitConverter.results')}>
          {result.state === 'valid' ? (
            <ToolResults
              rows={result.rows.map((row) => ({
                label: label(row.unit),
                value: (
                  <code className={styles.value}>
                    {row.approximate ? '≈ ' : ''}
                    {row.text}
                  </code>
                ),
                action: (
                  <CopyButton
                    value={row.text}
                    label={t('common.copy')}
                    copiedLabel={t('common.copied')}
                  />
                ),
              }))}
            />
          ) : (
            <p className={styles.note}>{t('tools.unitConverter.empty')}</p>
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
