import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const MAX_N = 1000;

type Result =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'ok'; factorial: string; permutations: string; combinations: string };

function factorial(k: number): bigint {
  let acc = 1n;
  for (let i = 2n; i <= BigInt(k); i++) {
    acc *= i;
  }
  return acc;
}

function compute(nStr: string, rStr: string): Result {
  const a = nStr.trim();
  const b = rStr.trim();
  if (a === '' || b === '') {
    return { kind: 'empty' };
  }
  if (!/^\d+$/.test(a) || !/^\d+$/.test(b)) {
    return { kind: 'invalid' };
  }
  const n = Number(a);
  const r = Number(b);
  if (!Number.isInteger(n) || !Number.isInteger(r) || n > MAX_N || r > n) {
    return { kind: 'invalid' };
  }
  const factN = factorial(n);
  const permutations = factN / factorial(n - r);
  const combinations = permutations / factorial(r);
  return {
    kind: 'ok',
    factorial: factN.toString(),
    permutations: permutations.toString(),
    combinations: combinations.toString(),
  };
}

export default function Combinatorics() {
  const { t } = useI18n();
  const [nStr, setNStr] = useState('5');
  const [rStr, setRStr] = useState('2');
  const result = useMemo(() => compute(nStr, rStr), [nStr, rStr]);

  const rows =
    result.kind === 'ok'
      ? [
          { label: t('tools.combinatorics.factorial'), value: result.factorial },
          { label: t('tools.combinatorics.permutations'), value: result.permutations },
          { label: t('tools.combinatorics.combinations'), value: result.combinations },
        ]
      : [];

  return (
    <ToolLayout
      title={t('tools.combinatorics.name')}
      description={t('tools.combinatorics.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.inputs}>
        <label className={styles.field}>
          <span className={styles.label}>{t('tools.combinatorics.n')}</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={nStr}
            onChange={(e) => setNStr(e.target.value)}
            aria-label={t('tools.combinatorics.n')}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t('tools.combinatorics.r')}</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={rStr}
            onChange={(e) => setRStr(e.target.value)}
            aria-label={t('tools.combinatorics.r')}
          />
        </label>
      </div>

      {result.kind === 'invalid' && (
        <p className={styles.error}>{t('tools.combinatorics.invalid')}</p>
      )}

      {rows.length > 0 && (
        <div className={styles.results}>
          {rows.map((r) => (
            <div key={r.label} className={styles.row}>
              <span className={styles.rowLabel}>{r.label}</span>
              <code className={styles.rowValue}>{r.value}</code>
              <CopyButton
                value={r.value}
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
