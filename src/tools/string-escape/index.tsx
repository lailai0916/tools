import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Button, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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
        <Segmented<typeof mode>
          value={mode}
          onChange={setMode}
          items={[
            { value: 'escape', label: t('tools.stringEscape.escape') },
            { value: 'unescape', label: t('tools.stringEscape.unescape') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.mode')}
        />
      </div>

      <ToolGrid>
        <ToolPane
          title={t('common.input')}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            invalid={invalid}
            placeholder={t('tools.stringEscape.placeholder')}
            aria-label={t('common.input')}
          />
          {invalid && <Alert variant="danger">{t('tools.stringEscape.error')}</Alert>}
        </ToolPane>

        <ToolPane
          title={t('common.output')}
          actions={
            <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
          }
        >
          <TextArea value={output} readOnly aria-label={t('common.output')} />
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
