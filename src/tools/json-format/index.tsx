import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Button, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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
        <Segmented<typeof indent>
          value={indent}
          onChange={setIndent}
          items={[
            { value: 2, label: ['2', t('tools.jsonFormat.spaces')].join(' ') },
            { value: 4, label: ['4', t('tools.jsonFormat.spaces')].join(' ') },
            { value: 0, label: t('tools.jsonFormat.minify') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.options')}
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
            invalid={result.ok === false}
            placeholder={t('tools.jsonFormat.placeholder')}
            aria-label={t('common.input')}
          />
          {error && <Alert variant="danger">{error}</Alert>}
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
