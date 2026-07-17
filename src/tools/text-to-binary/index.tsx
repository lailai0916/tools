import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'encode' | 'decode';

type Result = { ok: true; output: string } | { ok: false } | { ok: null };

function encode(input: string): Result {
  const bytes = new TextEncoder().encode(input);
  return { ok: true, output: Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join(' ') };
}

function decode(input: string): Result {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const bytes: number[] = [];
  for (const tok of tokens) {
    if (!/^[01]{1,8}$/.test(tok)) {
      return { ok: false };
    }
    bytes.push(parseInt(tok, 2));
  }
  return { ok: true, output: new TextDecoder().decode(new Uint8Array(bytes)) };
}

function process(input: string, mode: Mode): Result {
  if (!input) {
    return { ok: null };
  }
  switch (mode) {
    case 'encode':
      return encode(input);
    case 'decode':
      return decode(input);
  }
}

export default function TextToBinary() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const result = useMemo(() => process(input, mode), [input, mode]);

  const output = result.ok === true ? result.output : '';

  return (
    <ToolLayout
      title={t('tools.textToBinary.name')}
      description={t('tools.textToBinary.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'encode'} onClick={() => setMode('encode')}>
            {t('tools.textToBinary.encode')}
          </Button>
          <Button size="sm" active={mode === 'decode'} onClick={() => setMode('decode')}>
            {t('tools.textToBinary.decode')}
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
          invalid={result.ok === false}
          placeholder={
            mode === 'encode'
              ? t('tools.textToBinary.textPlaceholder')
              : t('tools.textToBinary.binaryPlaceholder')
          }
          aria-label={t('common.input')}
        />
        {result.ok === false && <p className={styles.error}>{t('tools.textToBinary.error')}</p>}
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
