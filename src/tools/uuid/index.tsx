import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const COUNTS = [1, 5, 10, 20] as const;
type Version = 'v4' | 'v7';

function uuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let timestamp = BigInt(Date.now());
  for (let index = 5; index >= 0; index--) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generate(count: number, version: Version): string {
  return Array.from({ length: count }, () =>
    version === 'v4' ? crypto.randomUUID() : uuidV7()
  ).join('\n');
}

export default function Uuid() {
  const { t } = useI18n();
  const [version, setVersion] = useState<Version>('v4');
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>(() => generate(1, 'v4'));

  const regenerate = (n: number, nextVersion = version) => {
    setCount(n);
    setVersion(nextVersion);
    setOutput(generate(n, nextVersion));
  };

  return (
    <ToolLayout
      title={t('tools.uuid.name')}
      description={t('tools.uuid.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.options}>
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>{t('tools.uuid.version')}</span>
            <div className={styles.counts} role="group" aria-label={t('tools.uuid.version')}>
              {(['v4', 'v7'] as const).map((item) => (
                <Button
                  key={item}
                  size="sm"
                  active={version === item}
                  onClick={() => regenerate(count, item)}
                  aria-pressed={version === item}
                >
                  {item.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>{t('tools.uuid.count')}</span>
            <div className={styles.counts} role="group" aria-label={t('tools.uuid.count')}>
              {COUNTS.map((n) => (
                <Button key={n} size="sm" active={count === n} onClick={() => regenerate(n)}>
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button size="sm" variant="primary" onClick={() => regenerate(count)}>
          {t('tools.uuid.regenerate')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
