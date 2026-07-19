import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import Field from '@/components/Field';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'encode' | 'decode';

type Result = { ok: true; output: string } | { ok: false; error: string } | { ok: null };

function encode(input: string): Result {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return { ok: true, output: btoa(binary) };
}

function decode(input: string): Result {
  try {
    const binary = atob(input.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { ok: true, output: new TextDecoder().decode(bytes) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
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

export default function Base64() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const result = useMemo(() => process(input, mode), [input, mode]);

  const output = result.ok === true ? result.output : '';
  const error = result.ok === false ? result.error : '';

  return (
    <ToolLayout
      title={t('tools.base64.name')}
      description={t('tools.base64.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'encode'} onClick={() => setMode('encode')}>
            {t('tools.base64.encode')}
          </Button>
          <Button size="sm" active={mode === 'decode'} onClick={() => setMode('decode')}>
            {t('tools.base64.decode')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <Field
        label={t('common.input')}
        htmlFor="base64-input"
        error={error ? t('tools.base64.decodeError') : undefined}
      >
        <TextArea
          id="base64-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={
            mode === 'encode'
              ? t('tools.base64.encodePlaceholder')
              : t('tools.base64.decodePlaceholder')
          }
          aria-label={t('common.input')}
          aria-describedby={error ? 'base64-input-error' : undefined}
        />
      </Field>

      <Field
        label={t('common.output')}
        htmlFor="base64-output"
        action={
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <TextArea id="base64-output" value={output} readOnly aria-label={t('common.output')} />
      </Field>
    </ToolLayout>
  );
}
