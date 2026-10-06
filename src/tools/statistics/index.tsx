import { Alert, Button, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { mathGuides } from '@/content/toolGuides/math';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  computeStatistics,
  formatStatisticNumber as fmt,
  type StatisticsValues,
  type VarianceMode,
} from '@/utils/statistics';
import styles from './styles.module.css';

type Stats = { labelKey: MessageKey; value: string }[];

function displayStatistics(values: StatisticsValues, varianceMode: VarianceMode): Stats {
  const { count: n, sum, mean, median, modes, min, max, range, variance, stddev } = values;
  const stats: Stats = [
    { labelKey: 'tools.statistics.count', value: String(n) },
    { labelKey: 'tools.statistics.sum', value: fmt(sum) },
    { labelKey: 'tools.statistics.mean', value: fmt(mean) },
    { labelKey: 'tools.statistics.median', value: fmt(median) },
    { labelKey: 'tools.statistics.mode', value: modes.map(fmt).join(', ') },
    { labelKey: 'tools.statistics.min', value: fmt(min) },
    { labelKey: 'tools.statistics.max', value: fmt(max) },
    { labelKey: 'tools.statistics.range', value: fmt(range) },
    {
      labelKey:
        varianceMode === 'sample'
          ? 'tools.statistics.varianceSample'
          : 'tools.statistics.variancePopulation',
      value: variance === null ? '—' : fmt(variance),
    },
    {
      labelKey:
        varianceMode === 'sample'
          ? 'tools.statistics.stddevSample'
          : 'tools.statistics.stddevPopulation',
      value: stddev === null ? '—' : fmt(stddev),
    },
  ];
  return stats;
}

export default function Statistics() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [varianceMode, setVarianceMode] = useState<VarianceMode>('population');
  const result = useMemo(() => computeStatistics(input, varianceMode), [input, varianceMode]);

  return (
    <ToolLayout
      guide={mathGuides.statistics}
      title={t('tools.statistics.name')}
      description={t('tools.statistics.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.controlLeft}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Segmented<typeof varianceMode>
            value={varianceMode}
            onChange={setVarianceMode}
            items={[
              { value: 'population', label: t('tools.statistics.population') },
              { value: 'sample', label: t('tools.statistics.sample') },
            ]}
            orientation="horizontal"
            size="sm"
            stackAt={0}
            ariaLabel={t('tools.statistics.varianceMode')}
          />
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        invalid={result.kind === 'invalid'}
        placeholder={t('tools.statistics.placeholder')}
        aria-label={t('common.input')}
      />

      {result.kind === 'invalid' && (
        <Alert variant="danger">
          {t(
            result.reason === 'range' ? 'tools.statistics.rangeError' : 'tools.statistics.invalid'
          )}
        </Alert>
      )}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.statistics.empty')}</p>}

      {result.kind === 'ok' && (
        <div className={styles.results}>
          {displayStatistics(result.values, varianceMode).map((s) => (
            <div key={s.labelKey} className={styles.row}>
              <span className={styles.rowLabel}>{t(s.labelKey)}</span>
              <code className={styles.rowValue}>{s.value}</code>
              <CopyButton
                value={s.value}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
