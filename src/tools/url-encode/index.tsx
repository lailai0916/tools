import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'encode' | 'decode';
type Result = { ok: true; output: string } | { ok: false; error: string } | { ok: null };

function process(input: string, mode: Mode): Result {
  if (!input) {
    return { ok: null };
  }
  try {
    const output = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export default function UrlEncode() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const result = useMemo(() => process(input, mode), [input, mode]);

  const output = result.ok === true ? result.output : '';
  const error = result.ok === false ? result.error : '';

  return (
    <ToolLayout
      title={t('tools.urlEncode.name')}
      description={t('tools.urlEncode.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'encode'} onClick={() => setMode('encode')}>
            {t('tools.urlEncode.encode')}
          </Button>
          <Button size="sm" active={mode === 'decode'} onClick={() => setMode('decode')}>
            {t('tools.urlEncode.decode')}
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
          placeholder={t('tools.urlEncode.placeholder')}
          aria-label={t('common.input')}
        />
        {error && <p className={styles.error}>{error}</p>}
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
