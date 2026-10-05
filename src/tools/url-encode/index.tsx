import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Button, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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
        <Segmented<typeof mode>
          value={mode}
          onChange={setMode}
          items={[
            { value: 'encode', label: t('tools.urlEncode.encode') },
            { value: 'decode', label: t('tools.urlEncode.decode') },
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
            invalid={result.ok === false}
            placeholder={t('tools.urlEncode.placeholder')}
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
