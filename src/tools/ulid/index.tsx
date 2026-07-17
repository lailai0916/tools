import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const COUNTS = [1, 5, 10] as const;
// Crockford Base32 — no I, L, O, U to avoid ambiguity.
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// 48-bit timestamp → 10 chars (10 × 5 = 50 bits, top 2 unused).
function encodeTime(time: number): string {
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = ENCODING[time % 32] + out;
    time = Math.floor(time / 32);
  }
  return out;
}

// 80 random bits → 16 chars. Each byte % 32 is uniform since 256 is a multiple of 32.
function encodeRandom(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += ENCODING[bytes[i] % 32];
  }
  return out;
}

function ulid(): string {
  return encodeTime(Date.now()) + encodeRandom();
}

function generate(count: number): string {
  return Array.from({ length: count }, ulid).join('\n');
}

export default function Ulid() {
  const { t } = useI18n();
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>(() => generate(1));

  const regenerate = (n: number) => {
    setCount(n);
    setOutput(generate(n));
  };

  return (
    <ToolLayout
      title={t('tools.ulid.name')}
      description={t('tools.ulid.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.group}>
          <span className={styles.groupLabel}>{t('tools.ulid.count')}</span>
          <div className={styles.counts}>
            {COUNTS.map((n) => (
              <Button key={n} size="sm" active={count === n} onClick={() => regenerate(n)}>
                {n}
              </Button>
            ))}
          </div>
        </div>
        <Button size="sm" variant="primary" onClick={() => regenerate(count)}>
          {t('tools.ulid.regenerate')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.ulid.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('tools.ulid.output')} />
      </div>
    </ToolLayout>
  );
}
