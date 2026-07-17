import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const COUNTS = [1, 5, 10] as const;

function randomHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return '#' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function generate(count: number): string[] {
  return Array.from({ length: count }, randomHex);
}

export default function RandomColor() {
  const { t } = useI18n();
  const [count, setCount] = useState<number>(5);
  const [colors, setColors] = useState<string[]>(() => generate(5));

  const regenerate = (n: number) => {
    setCount(n);
    setColors(generate(n));
  };

  return (
    <ToolLayout
      title={t('tools.randomColor.name')}
      description={t('tools.randomColor.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.group}>
          <span className={styles.groupLabel}>{t('tools.randomColor.count')}</span>
          <div className={styles.counts}>
            {COUNTS.map((n) => (
              <Button key={n} size="sm" active={count === n} onClick={() => regenerate(n)}>
                {n}
              </Button>
            ))}
          </div>
        </div>
        <Button size="sm" variant="primary" onClick={() => regenerate(count)}>
          {t('tools.randomColor.regenerate')}
        </Button>
      </div>

      <div className={styles.grid}>
        {colors.map((color, i) => (
          <div className={styles.swatch} key={`${color}-${i}`}>
            <div className={styles.block} style={{ background: color }} />
            <div className={styles.meta}>
              <code className={styles.hex}>{color}</code>
              <CopyButton value={color} label={t('common.copy')} copiedLabel={t('common.copied')} />
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
