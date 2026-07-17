import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Result = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'ok'; gcd: string; lcm: string };

function bgcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function compute(input: string): Result {
  const tokens = input
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return { kind: 'empty' };
  }
  const values: bigint[] = [];
  for (const tok of tokens) {
    if (!/^[+-]?\d+$/.test(tok)) {
      return { kind: 'invalid' };
    }
    const v = BigInt(tok);
    values.push(v < 0n ? -v : v);
  }
  let g = 0n;
  let l = 1n;
  for (const v of values) {
    g = bgcd(g, v);
    l = v === 0n ? 0n : (l / bgcd(l, v)) * v;
  }
  return { kind: 'ok', gcd: g.toString(), lcm: l.toString() };
}

export default function GcdLcm() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => compute(input), [input]);

  const rows =
    result.kind === 'ok'
      ? [
          { label: t('tools.gcdLcm.gcd'), value: result.gcd },
          { label: t('tools.gcdLcm.lcm'), value: result.lcm },
        ]
      : [];

  return (
    <ToolLayout
      title={t('tools.gcdLcm.name')}
      description={t('tools.gcdLcm.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        invalid={result.kind === 'invalid'}
        placeholder={t('tools.gcdLcm.placeholder')}
        aria-label={t('common.input')}
      />

      {result.kind === 'invalid' && <p className={styles.error}>{t('tools.gcdLcm.invalid')}</p>}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.gcdLcm.empty')}</p>}

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
