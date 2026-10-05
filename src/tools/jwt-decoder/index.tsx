import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Decoded = {
  ok: true;
  header: string;
  payload: string;
  signature: string;
};

type Result = Decoded | { ok: false } | { ok: null };

function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function prettyJson(segment: string): string {
  return JSON.stringify(JSON.parse(base64UrlDecode(segment)), null, 2);
}

function decode(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return { ok: false };
  }
  try {
    return {
      ok: true,
      header: prettyJson(parts[0]),
      payload: prettyJson(parts[1]),
      signature: parts[2],
    };
  } catch {
    return { ok: false };
  }
}

export default function JwtDecoder() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => decode(input), [input]);

  return (
    <ToolLayout
      title={t('tools.jwtDecoder.name')}
      description={t('tools.jwtDecoder.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={t('tools.jwtDecoder.placeholder')}
          aria-label={t('common.input')}
        />
        {result.ok === false && <Alert variant="danger">{t('tools.jwtDecoder.invalid')}</Alert>}
      </div>

      {result.ok === true && (
        <>
          <ToolPane
            title={t('tools.jwtDecoder.header')}
            actions={
              <CopyButton
                value={result.header}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            }
          >
            <TextArea value={result.header} readOnly aria-label={t('tools.jwtDecoder.header')} />
          </ToolPane>

          <ToolPane
            title={t('tools.jwtDecoder.payload')}
            actions={
              <CopyButton
                value={result.payload}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            }
          >
            <TextArea value={result.payload} readOnly aria-label={t('tools.jwtDecoder.payload')} />
          </ToolPane>

          <ToolPane title={t('tools.jwtDecoder.signature')}>
            <code className={styles.signature}>{result.signature}</code>
          </ToolPane>

          <p className={styles.note}>{t('tools.jwtDecoder.note')}</p>
        </>
      )}
    </ToolLayout>
  );
}
