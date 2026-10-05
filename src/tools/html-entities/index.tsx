import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Button, TextAreaField, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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
        <Segmented<typeof mode>
          value={mode}
          onChange={setMode}
          items={[
            { value: 'encode', label: t('tools.htmlEntities.encode') },
            { value: 'decode', label: t('tools.htmlEntities.decode') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.mode')}
        />
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <ToolGrid>
        <TextAreaField
          wrapperClassName={styles.pane}
          label={t('common.input')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.htmlEntities.placeholder')}
          aria-label={t('common.input')}
        />

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
