import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const COUNTS = [1, 5, 10] as const;
const DEFAULT_LENGTH = 21;
const MAX_LENGTH = 512;
// URL-safe alphabet: A-Z, a-z, 0-9, _ and - (64 symbols).
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

// Rejection sampling keeps the distribution uniform for any alphabet size.
function nanoid(size: number): string {
  const mask = (2 << Math.floor(Math.log2(ALPHABET.length - 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / ALPHABET.length);
  let id = '';
  while (true) {
    const bytes = crypto.getRandomValues(new Uint8Array(step));
    for (let i = 0; i < step; i++) {
      const index = bytes[i] & mask;
      if (index < ALPHABET.length) {
        id += ALPHABET[index];
        if (id.length === size) {
          return id;
        }
      }
    }
  }
}

function generate(size: number, count: number): string {
  return Array.from({ length: count }, () => nanoid(size)).join('\n');
}

export default function Nanoid() {
  const { t } = useI18n();
  const [length, setLength] = useState<string>(String(DEFAULT_LENGTH));
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>(() => generate(DEFAULT_LENGTH, 1));

  const size = Number(length);
  const validSize = Number.isInteger(size) && size >= 1 && size <= MAX_LENGTH;

  const editLength = (value: string) => {
    setLength(value);
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= MAX_LENGTH) {
      setOutput(generate(n, count));
    }
  };

  const editCount = (n: number) => {
    setCount(n);
    if (validSize) {
      setOutput(generate(size, n));
    }
  };

  const regenerate = () => {
    if (validSize) {
      setOutput(generate(size, count));
    }
  };

  return (
    <ToolLayout
      title={t('tools.nanoid.name')}
      description={t('tools.nanoid.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.options}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nanoid-length">
              {t('tools.nanoid.length')}
            </label>
            <input
              id="nanoid-length"
              className={styles.input}
              type="number"
              min={1}
              max={MAX_LENGTH}
              value={length}
              data-invalid={!validSize}
              onChange={(e) => editLength(e.target.value)}
              aria-label={t('tools.nanoid.length')}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>{t('tools.nanoid.count')}</span>
            <div className={styles.counts}>
              {COUNTS.map((n) => (
                <Button key={n} size="sm" active={count === n} onClick={() => editCount(n)}>
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button size="sm" variant="primary" onClick={regenerate} disabled={!validSize}>
          {t('tools.nanoid.regenerate')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.nanoid.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('tools.nanoid.output')} />
      </div>
    </ToolLayout>
  );
}
