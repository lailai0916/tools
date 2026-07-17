import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const LIMIT = 1e15;

type Result =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'tooLarge' }
  | { kind: 'ok'; isPrime: boolean; factorization: string; divisors: string };

function compute(input: string): Result {
  const s = input.trim();
  if (s === '') {
    return { kind: 'empty' };
  }
  if (!/^\d+$/.test(s)) {
    return { kind: 'invalid' };
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1) {
    return { kind: 'invalid' };
  }
  if (n > LIMIT) {
    return { kind: 'tooLarge' };
  }

  const factors: [number, number][] = [];
  let m = n;
  let e2 = 0;
  while (m % 2 === 0) {
    m /= 2;
    e2++;
  }
  if (e2 > 0) {
    factors.push([2, e2]);
  }
  for (let p = 3; p * p <= m; p += 2) {
    if (m % p === 0) {
      let e = 0;
      while (m % p === 0) {
        m /= p;
        e++;
      }
      factors.push([p, e]);
    }
  }
  if (m > 1) {
    factors.push([m, 1]);
  }

  const isPrime = n >= 2 && factors.length === 1 && factors[0][1] === 1;
  const factorization =
    factors.length === 0
      ? '1'
      : factors.map(([p, e]) => (e === 1 ? String(p) : `${p}^${e}`)).join(' × ');
  const divisors = factors.reduce((acc, [, e]) => acc * (e + 1), 1);

  return { kind: 'ok', isPrime, factorization, divisors: String(divisors) };
}

export default function PrimeFactor() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => compute(input), [input]);

  return (
    <ToolLayout
      title={t('tools.primeFactor.name')}
      description={t('tools.primeFactor.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <input
        className={styles.input}
        type="number"
        inputMode="numeric"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('tools.primeFactor.placeholder')}
        aria-label={t('common.input')}
      />

      {result.kind === 'invalid' && (
        <p className={styles.error}>{t('tools.primeFactor.invalid')}</p>
      )}
      {result.kind === 'tooLarge' && (
        <p className={styles.error}>{t('tools.primeFactor.tooLarge')}</p>
      )}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.primeFactor.empty')}</p>}

      {result.kind === 'ok' && (
        <div className={styles.results}>
          <div className={styles.verdict} data-prime={result.isPrime}>
            {result.isPrime ? t('tools.primeFactor.isPrime') : t('tools.primeFactor.notPrime')}
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t('tools.primeFactor.factorization')}</span>
            <code className={styles.rowValue}>{result.factorization}</code>
            <CopyButton
              value={result.factorization}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t('tools.primeFactor.divisors')}</span>
            <code className={styles.rowValue}>{result.divisors}</code>
            <CopyButton
              value={result.divisors}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
