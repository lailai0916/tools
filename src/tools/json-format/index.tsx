import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Result = { ok: true; output: string } | { ok: false; error: string } | { ok: null };

function process(input: string, indent: number | 0): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, output: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export default function JsonFormat() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<number>(2);

  const result = useMemo(() => process(input, indent), [input, indent]);

  const output = result.ok === true ? result.output : '';
  const error = result.ok === false ? result.error : '';

  return (
    <ToolLayout
      title={t('tools.jsonFormat.name')}
      description={t('tools.jsonFormat.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.indents}>
          <Button size="sm" active={indent === 2} onClick={() => setIndent(2)}>
            2 {t('tools.jsonFormat.spaces')}
          </Button>
          <Button size="sm" active={indent === 4} onClick={() => setIndent(4)}>
            4 {t('tools.jsonFormat.spaces')}
          </Button>
          <Button size="sm" active={indent === 0} onClick={() => setIndent(0)}>
            {t('tools.jsonFormat.minify')}
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
          placeholder={t('tools.jsonFormat.placeholder')}
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
