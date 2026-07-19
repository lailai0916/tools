import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

function shiftText(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return input.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

function clampShift(n: number): number {
  return Number.isFinite(n) ? Math.min(25, Math.max(0, Math.round(n))) : 0;
}

export default function CaesarCipher() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);

  const output = useMemo(() => shiftText(input, shift), [input, shift]);

  return (
    <ToolLayout
      title={t('tools.caesarCipher.name')}
      description={t('tools.caesarCipher.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.shiftGroup}>
          <label className={styles.label} htmlFor="caesar-shift">
            {t('tools.caesarCipher.shift')}
          </label>
          <input
            id="caesar-shift"
            type="number"
            className={styles.num}
            min={0}
            max={25}
            value={shift}
            onChange={(e) => setShift(clampShift(Number(e.target.value)))}
          />
          <input
            type="range"
            className={styles.range}
            min={0}
            max={25}
            value={shift}
            onInput={(e) => setShift(Number(e.currentTarget.value))}
            aria-label={t('tools.caesarCipher.shift')}
          />
          <Button size="sm" active={shift === 13} onClick={() => setShift(13)}>
            {t('tools.caesarCipher.rot13')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.caesarCipher.placeholder')}
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.caesarCipher.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('tools.caesarCipher.output')} />
      </div>
    </ToolLayout>
  );
}
