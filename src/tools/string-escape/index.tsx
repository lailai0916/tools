import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'escape' | 'unescape';

type Result = { ok: true; output: string } | { ok: false } | { ok: null };

function process(input: string, mode: Mode): Result {
  if (!input) {
    return { ok: null };
  }
  if (mode === 'escape') {
    return { ok: true, output: JSON.stringify(input).slice(1, -1) };
  }
  try {
    return { ok: true, output: JSON.parse('"' + input + '"') };
  } catch {
    return { ok: false };
  }
}

export default function StringEscape() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('escape');

  const result = useMemo(() => process(input, mode), [input, mode]);

  const output = result.ok === true ? result.output : '';
  const invalid = result.ok === false;

  return (
    <ToolLayout
      title={t('tools.stringEscape.name')}
      description={t('tools.stringEscape.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'escape'} onClick={() => setMode('escape')}>
            {t('tools.stringEscape.escape')}
          </Button>
          <Button size="sm" active={mode === 'unescape'} onClick={() => setMode('unescape')}>
            {t('tools.stringEscape.unescape')}
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
          invalid={invalid}
          placeholder={t('tools.stringEscape.placeholder')}
          aria-label={t('common.input')}
        />
        {invalid && <p className={styles.error}>{t('tools.stringEscape.error')}</p>}
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
