import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Result = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'ok'; value: string };

function modpow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) {
    return 0n;
  }
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % mod;
    }
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

function compute(baseStr: string, expStr: string, modStr: string): Result {
  const a = baseStr.trim();
  const b = expStr.trim();
  const c = modStr.trim();
  if (a === '' || b === '' || c === '') {
    return { kind: 'empty' };
  }
  if (!/^[+-]?\d+$/.test(a) || !/^\d+$/.test(b) || !/^\d+$/.test(c)) {
    return { kind: 'invalid' };
  }
  const mod = BigInt(c);
  if (mod < 1n) {
    return { kind: 'invalid' };
  }
  return { kind: 'ok', value: modpow(BigInt(a), BigInt(b), mod).toString() };
}

export default function ModPower() {
  const { t } = useI18n();
  const [baseStr, setBaseStr] = useState('2');
  const [expStr, setExpStr] = useState('10');
  const [modStr, setModStr] = useState('1000');
  const result = useMemo(() => compute(baseStr, expStr, modStr), [baseStr, expStr, modStr]);

  const fields: { key: MessageKey; value: string; set: (v: string) => void }[] = [
    { key: 'tools.modPower.base', value: baseStr, set: setBaseStr },
    { key: 'tools.modPower.exponent', value: expStr, set: setExpStr },
    { key: 'tools.modPower.modulus', value: modStr, set: setModStr },
  ];

  return (
    <ToolLayout
      title={t('tools.modPower.name')}
      description={t('tools.modPower.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.inputs}>
        {fields.map((f) => (
          <label key={f.key} className={styles.field}>
            <span className={styles.label}>{t(f.key)}</span>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              aria-label={t(f.key)}
            />
          </label>
        ))}
      </div>

      {result.kind === 'invalid' && <p className={styles.error}>{t('tools.modPower.invalid')}</p>}

      {result.kind === 'ok' && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tools.modPower.result')}</span>
          <code className={styles.rowValue}>{result.value}</code>
          <CopyButton
            value={result.value}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
      )}
    </ToolLayout>
  );
}
