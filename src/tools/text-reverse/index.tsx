import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import { splitGraphemes } from '@/utils/text';
import styles from './styles.module.css';

type Mode = 'char' | 'word' | 'line';

function reverse(input: string, mode: Mode): string {
  switch (mode) {
    case 'char':
      return splitGraphemes(input).reverse().join('');
    case 'word':
      return input.trim() ? input.trim().split(/\s+/).reverse().join(' ') : '';
    case 'line':
      return input
        .split(/\r\n|\r|\n/)
        .reverse()
        .join('\n');
  }
}

export default function TextReverse() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('char');

  const output = useMemo(() => reverse(input, mode), [input, mode]);

  return (
    <ToolLayout
      title={t('tools.textReverse.name')}
      description={t('tools.textReverse.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'char'} onClick={() => setMode('char')}>
            {t('tools.textReverse.byChar')}
          </Button>
          <Button size="sm" active={mode === 'word'} onClick={() => setMode('word')}>
            {t('tools.textReverse.byWord')}
          </Button>
          <Button size="sm" active={mode === 'line'} onClick={() => setMode('line')}>
            {t('tools.textReverse.byLine')}
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
          placeholder={t('tools.textReverse.placeholder')}
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
