import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const BITS = [128, 256, 512] as const;
type Bits = (typeof BITS)[number];

type Key = { hex: string; base64: string };

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return btoa(s);
}

function generate(bits: Bits): Key {
  const bytes = new Uint8Array(bits / 8);
  crypto.getRandomValues(bytes);
  return { hex: toHex(bytes), base64: toBase64(bytes) };
}

export default function KeyGenerator() {
  const { t } = useI18n();
  const [bits, setBits] = useState<Bits>(256);
  const [key, setKey] = useState<Key>(() => generate(256));

  const regenerate = (b: Bits) => {
    setBits(b);
    setKey(generate(b));
  };

  const rows: { label: string; value: string }[] = [
    { label: t('tools.keyGenerator.hex'), value: key.hex },
    { label: t('tools.keyGenerator.base64'), value: key.base64 },
  ];

  return (
    <ToolLayout
      title={t('tools.keyGenerator.name')}
      description={t('tools.keyGenerator.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.group}>
          <span className={styles.label}>{t('tools.keyGenerator.bits')}</span>
          {BITS.map((b) => (
            <Button key={b} size="sm" active={bits === b} onClick={() => regenerate(b)}>
              {b}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="primary" onClick={() => regenerate(bits)}>
          {t('tools.keyGenerator.regenerate')}
        </Button>
      </div>

      <div className={styles.results}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.rowLabel}>{row.label}</span>
            <code className={styles.rowValue}>{row.value}</code>
            <CopyButton
              value={row.value}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
