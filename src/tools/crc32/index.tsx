import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

const TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(text: string): number {
  const bytes = new TextEncoder().encode(text);
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export default function Crc32() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const empty = input.length === 0;

  const { hex, decimal } = useMemo(() => {
    if (empty) {
      return { hex: '', decimal: '' };
    }
    const value = crc32(input);
    return {
      hex: value.toString(16).toUpperCase().padStart(8, '0'),
      decimal: String(value),
    };
  }, [input, empty]);

  const rows: { labelKey: MessageKey; value: string }[] = [
    { labelKey: 'tools.crc32.hex', value: hex },
    { labelKey: 'tools.crc32.decimal', value: decimal },
  ];

  return (
    <ToolLayout
      title={t('tools.crc32.name')}
      description={t('tools.crc32.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={empty}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.crc32.placeholder')}
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.rows}>
        {rows.map(({ labelKey, value }) => (
          <div className={styles.row} key={labelKey}>
            <span className={styles.rowLabel}>{t(labelKey)}</span>
            <code className={styles.rowValue} data-empty={empty}>
              {empty ? t('tools.crc32.empty') : value}
            </code>
            <CopyButton
              value={value}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={empty}
            />
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
