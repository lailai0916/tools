import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'toJson' | 'toQuery';
type Result = { ok: true; output: string } | { ok: false } | { ok: null };

function queryToJson(input: string): Result {
  const trimmed = input.trim().replace(/^[?#]/, '');
  if (!trimmed) {
    return { ok: null };
  }
  const params = new URLSearchParams(trimmed);
  const obj: Record<string, string | string[]> = {};
  for (const [key, value] of params.entries()) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const existing = obj[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[key] = [existing, value];
      }
    } else {
      obj[key] = value;
    }
  }
  return { ok: true, output: JSON.stringify(obj, null, 2) };
}

function toParamValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function jsonToQuery(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false };
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, toParamValue(item));
      }
    } else {
      params.append(key, toParamValue(value));
    }
  }
  return { ok: true, output: params.toString() };
}

export default function QueryJson() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('toJson');

  const result = useMemo(
    () => (mode === 'toJson' ? queryToJson(input) : jsonToQuery(input)),
    [input, mode]
  );

  const output = result.ok === true ? result.output : '';

  return (
    <ToolLayout
      title={t('tools.queryJson.name')}
      description={t('tools.queryJson.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'toJson'} onClick={() => setMode('toJson')}>
            {t('tools.queryJson.toJson')}
          </Button>
          <Button size="sm" active={mode === 'toQuery'} onClick={() => setMode('toQuery')}>
            {t('tools.queryJson.toQuery')}
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
          placeholder={
            mode === 'toJson'
              ? t('tools.queryJson.queryPlaceholder')
              : t('tools.queryJson.jsonPlaceholder')
          }
          aria-label={t('common.input')}
        />
        {result.ok === false && <p className={styles.error}>{t('tools.queryJson.error')}</p>}
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
