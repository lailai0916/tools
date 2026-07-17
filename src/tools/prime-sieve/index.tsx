import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const LIMIT = 1_000_000;

type Result =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'tooLarge' }
  | { kind: 'ok'; count: number; primes: string };

function compute(input: string): Result {
  const s = input.trim();
  if (s === '') {
    return { kind: 'empty' };
  }
  if (!/^\d+$/.test(s)) {
    return { kind: 'invalid' };
  }
  const n = Number(s);
  if (!Number.isInteger(n)) {
    return { kind: 'invalid' };
  }
  if (n > LIMIT) {
    return { kind: 'tooLarge' };
  }
  if (n < 2) {
    return { kind: 'ok', count: 0, primes: '' };
  }
  const sieve = new Uint8Array(n + 1);
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i] === 0) {
      primes.push(i);
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = 1;
      }
    }
  }
  return { kind: 'ok', count: primes.length, primes: primes.join(' ') };
}

export default function PrimeSieve() {
  const { t } = useI18n();
  const [input, setInput] = useState('100');
  const result = useMemo(() => compute(input), [input]);

  return (
    <ToolLayout
      title={t('tools.primeSieve.name')}
      description={t('tools.primeSieve.description')}
      backLabel={t('common.back')}
    >
      <label className={styles.field}>
        <span className={styles.label}>{t('tools.primeSieve.limitLabel')}</span>
        <input
          className={styles.input}
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.primeSieve.placeholder')}
          aria-label={t('tools.primeSieve.limitLabel')}
        />
      </label>

      {result.kind === 'invalid' && <p className={styles.error}>{t('tools.primeSieve.invalid')}</p>}
      {result.kind === 'tooLarge' && (
        <p className={styles.error}>{t('tools.primeSieve.tooLarge')}</p>
      )}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.primeSieve.empty')}</p>}

      {result.kind === 'ok' && (
        <>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t('tools.primeSieve.count')}</span>
            <code className={styles.rowValue}>{result.count}</code>
          </div>
          <div className={styles.pane}>
            <div className={styles.outputHead}>
              <label className={styles.paneLabel}>{t('tools.primeSieve.primes')}</label>
              <CopyButton
                value={result.primes}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            </div>
            <TextArea value={result.primes} readOnly aria-label={t('tools.primeSieve.primes')} />
          </div>
        </>
      )}
    </ToolLayout>
  );
}
