import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Separator = ':' | '-';

const COUNTS = [1, 5, 10] as const;
const SEPARATORS: Separator[] = [':', '-'];

function macAddress(separator: Separator, upper: boolean): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  // Clear the multicast bit and set the locally-administered bit → valid unicast LAA.
  bytes[0] = (bytes[0] & 0xfe) | 0x02;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(separator);
  return upper ? hex.toUpperCase() : hex;
}

function generate(separator: Separator, upper: boolean, count: number): string {
  return Array.from({ length: count }, () => macAddress(separator, upper)).join('\n');
}

export default function MacAddress() {
  const { t } = useI18n();
  const [separator, setSeparator] = useState<Separator>(':');
  const [upper, setUpper] = useState(false);
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>(() => generate(':', false, 1));

  const editSeparator = (sep: Separator) => {
    setSeparator(sep);
    setOutput(generate(sep, upper, count));
  };

  const editUpper = (next: boolean) => {
    setUpper(next);
    setOutput(generate(separator, next, count));
  };

  const editCount = (n: number) => {
    setCount(n);
    setOutput(generate(separator, upper, n));
  };

  const regenerate = () => setOutput(generate(separator, upper, count));

  return (
    <ToolLayout
      title={t('tools.macAddress.name')}
      description={t('tools.macAddress.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.options}>
          <div className={styles.field}>
            <span className={styles.label}>{t('tools.macAddress.separator')}</span>
            <div className={styles.group}>
              {SEPARATORS.map((sep) => (
                <Button
                  key={sep}
                  size="sm"
                  active={separator === sep}
                  onClick={() => editSeparator(sep)}
                >
                  {sep}
                </Button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>{t('tools.macAddress.count')}</span>
            <div className={styles.group}>
              {COUNTS.map((n) => (
                <Button key={n} size="sm" active={count === n} onClick={() => editCount(n)}>
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <label className={styles.check}>
            <input type="checkbox" checked={upper} onChange={(e) => editUpper(e.target.checked)} />
            {t('tools.macAddress.uppercase')}
          </label>
        </div>
        <Button size="sm" variant="primary" onClick={regenerate}>
          {t('tools.macAddress.regenerate')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.macAddress.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('tools.macAddress.output')} />
      </div>
    </ToolLayout>
  );
}
