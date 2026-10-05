import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, Checkbox, TextField } from '@lailai0916/ui';
import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const MAX_COUNT = 1000;

// Unbiased integer in [0, n); handles ranges beyond 2^32 with a 64-bit draw.
function randomBelow(n: number): number {
  if (n <= 1) return 0;
  if (n <= 0x100000000) {
    const limit = 0x100000000 - (0x100000000 % n);
    const buf = new Uint32Array(1);
    let x: number;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % n;
  }
  const big = BigInt(n);
  const range = 1n << 64n;
  const limit = range - (range % big);
  const buf = new Uint32Array(2);
  let x: bigint;
  do {
    crypto.getRandomValues(buf);
    x = (BigInt(buf[0]) << 32n) | BigInt(buf[1]);
  } while (x >= limit);
  return Number(x % big);
}

function drawUnique(min: number, size: number, k: number): number[] {
  // Materialize and partial-shuffle when the pool is small; otherwise reject.
  if (size <= 100000) {
    const pool = Array.from({ length: size }, (_, i) => i);
    for (let i = 0; i < k; i++) {
      const j = i + randomBelow(size - i);
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    return pool.slice(0, k).map((v) => v + min);
  }
  const seen = new Set<number>();
  const out: number[] = [];
  while (out.length < k) {
    const v = randomBelow(size);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v + min);
    }
  }
  return out;
}

function parseInt10(s: string): number | null {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : null;
}

type Params = { lo: number; hi: number; k: number };

function validate(minS: string, maxS: string, countS: string): Params | null {
  const lo = parseInt10(minS);
  const hi = parseInt10(maxS);
  const k = parseInt10(countS);
  if (
    lo === null ||
    hi === null ||
    k === null ||
    lo > hi ||
    k < 1 ||
    !Number.isSafeInteger(hi - lo + 1)
  ) {
    return null;
  }
  return { lo, hi, k: Math.min(k, MAX_COUNT) };
}

function build(minS: string, maxS: string, countS: string, unique: boolean): string {
  const p = validate(minS, maxS, countS);
  if (!p) return '';
  const size = p.hi - p.lo + 1;
  const nums = unique
    ? drawUnique(p.lo, size, Math.min(p.k, size))
    : Array.from({ length: p.k }, () => p.lo + randomBelow(size));
  return nums.join('\n');
}

export default function RandomNumber() {
  const { t } = useI18n();
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(false);
  const [output, setOutput] = useState(() => build('1', '100', '5', false));

  const invalid = validate(min, max, count) === null;

  const run = (minS = min, maxS = max, countS = count, uniq = unique) => {
    setOutput(build(minS, maxS, countS, uniq));
  };

  return (
    <ToolLayout
      title={t('tools.randomNumber.name')}
      description={t('tools.randomNumber.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.options}>
        <div className={styles.fields}>
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.min')}
            id="rn-min"
            type="number"
            value={min}
            onChange={(e) => {
              setMin(e.target.value);
              run(e.target.value, max, count, unique);
            }}
            aria-label={t('tools.randomNumber.min')}
          />
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.max')}
            id="rn-max"
            type="number"
            value={max}
            onChange={(e) => {
              setMax(e.target.value);
              run(min, e.target.value, count, unique);
            }}
            aria-label={t('tools.randomNumber.max')}
          />
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.count')}
            id="rn-count"
            type="number"
            min={1}
            max={MAX_COUNT}
            value={count}
            onChange={(e) => {
              setCount(e.target.value);
              run(min, max, e.target.value, unique);
            }}
            aria-label={t('tools.randomNumber.count')}
          />
        </div>
        <Checkbox
          checked={unique}
          onChange={(e) => {
            setUnique(e.target.checked);
            run(min, max, count, e.target.checked);
          }}
          label={t('tools.randomNumber.unique')}
        />
      </div>

      <ToolPane
        title={t('tools.randomNumber.output')}
        actions={
          <div className={styles.actions}>
            <Button size="sm" variant="primary" onClick={() => run()} disabled={invalid}>
              {t('tools.randomNumber.regenerate')}
            </Button>
            <CopyButton
              value={output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={invalid}
            />
          </div>
        }
      >
        {invalid ? (
          <Alert variant="danger">{t('tools.randomNumber.invalidRange')}</Alert>
        ) : (
          <TextArea value={output} readOnly rows={6} aria-label={t('tools.randomNumber.output')} />
        )}
      </ToolPane>
    </ToolLayout>
  );
}
