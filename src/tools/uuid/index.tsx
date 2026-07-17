import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const COUNTS = [1, 5, 10, 20] as const;

function generate(count: number): string {
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
}

export default function Uuid() {
  const { t } = useI18n();
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>(() => generate(1));

  const regenerate = (n: number) => {
    setCount(n);
    setOutput(generate(n));
  };

  return (
    <ToolLayout
      title={t('tools.uuid.name')}
      description={t('tools.uuid.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.counts}>
          {COUNTS.map((n) => (
            <Button key={n} size="sm" active={count === n} onClick={() => regenerate(n)}>
              {n}
            </Button>
          ))}
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
