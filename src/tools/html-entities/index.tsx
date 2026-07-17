import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'encode' | 'decode';

function encode(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decode(input: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = input;
  return el.textContent ?? '';
}

export default function HtmlEntities() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const output = useMemo(() => {
    if (!input) {
      return '';
    }
    return mode === 'encode' ? encode(input) : decode(input);
  }, [input, mode]);

  return (
    <ToolLayout
      title={t('tools.htmlEntities.name')}
      description={t('tools.htmlEntities.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'encode'} onClick={() => setMode('encode')}>
            {t('tools.htmlEntities.encode')}
          </Button>
          <Button size="sm" active={mode === 'decode'} onClick={() => setMode('decode')}>
            {t('tools.htmlEntities.decode')}
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
          placeholder={t('tools.htmlEntities.placeholder')}
          aria-label={t('common.input')}
        />
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
