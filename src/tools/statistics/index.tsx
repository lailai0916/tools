import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

function fmt(n: number): string {
  if (Number.isInteger(n)) {
    return String(n);
  }
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? '0' : String(r);
}

type Stats = { labelKey: MessageKey; value: string }[];
type VarianceMode = 'population' | 'sample';

type Result = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'ok'; stats: Stats };

function compute(input: string, varianceMode: VarianceMode): Result {
  const tokens = input
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return { kind: 'empty' };
  }
  const values: number[] = [];
  for (const tok of tokens) {
    const n = Number(tok);
    if (!Number.isFinite(n)) {
      return { kind: 'invalid' };
    }
    values.push(n);
  }

  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  const freq = new Map<number, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let maxFreq = 0;
  for (const c of freq.values()) {
    if (c > maxFreq) {
      maxFreq = c;
    }
  }
  const seen = new Set<number>();
  const modes: number[] = [];
  for (const v of values) {
    if (freq.get(v) === maxFreq && !seen.has(v)) {
      seen.add(v);
      modes.push(v);
    }
  }

  const min = sorted[0];
  const max = sorted[n - 1];
  const sumSquares = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  const variance =
    varianceMode === 'sample' && n < 2
      ? null
      : sumSquares / (varianceMode === 'sample' ? n - 1 : n);
  const stddev = variance === null ? null : Math.sqrt(variance);

  const stats: Stats = [
    { labelKey: 'tools.statistics.count', value: String(n) },
    { labelKey: 'tools.statistics.sum', value: fmt(sum) },
    { labelKey: 'tools.statistics.mean', value: fmt(mean) },
    { labelKey: 'tools.statistics.median', value: fmt(median) },
    { labelKey: 'tools.statistics.mode', value: modes.map(fmt).join(', ') },
    { labelKey: 'tools.statistics.min', value: fmt(min) },
    { labelKey: 'tools.statistics.max', value: fmt(max) },
    { labelKey: 'tools.statistics.range', value: fmt(max - min) },
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
  return { kind: 'ok', stats };
}

export default function Statistics() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [varianceMode, setVarianceMode] = useState<VarianceMode>('population');
  const result = useMemo(() => compute(input, varianceMode), [input, varianceMode]);

  return (
    <ToolLayout
      title={t('tools.statistics.name')}
      description={t('tools.statistics.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.controlLeft}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <div
            className={styles.modes}
            role="group"
            aria-label={t('tools.statistics.varianceMode')}
          >
            <Button
              size="sm"
              active={varianceMode === 'population'}
              onClick={() => setVarianceMode('population')}
              aria-pressed={varianceMode === 'population'}
            >
              {t('tools.statistics.population')}
            </Button>
            <Button
              size="sm"
              active={varianceMode === 'sample'}
              onClick={() => setVarianceMode('sample')}
              aria-pressed={varianceMode === 'sample'}
            >
              {t('tools.statistics.sample')}
            </Button>
          </div>
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

      {result.kind === 'invalid' && <p className={styles.error}>{t('tools.statistics.invalid')}</p>}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.statistics.empty')}</p>}

      {result.kind === 'ok' && (
        <div className={styles.results}>
          {result.stats.map((s) => (
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
