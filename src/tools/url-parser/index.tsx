import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Row = { labelKey: MessageKey; value: string };
type Parsed = { rows: Row[]; params: { key: string; value: string }[] };
type Result = { ok: true; data: Parsed } | { ok: false } | { ok: null };

function parse(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false };
  }
  const rows: Row[] = [
    { labelKey: 'tools.urlParser.protocol', value: url.protocol },
    { labelKey: 'tools.urlParser.host', value: url.host },
    { labelKey: 'tools.urlParser.hostname', value: url.hostname },
    { labelKey: 'tools.urlParser.port', value: url.port },
    { labelKey: 'tools.urlParser.pathname', value: url.pathname },
    { labelKey: 'tools.urlParser.search', value: url.search },
    { labelKey: 'tools.urlParser.hash', value: url.hash },
    { labelKey: 'tools.urlParser.origin', value: url.origin },
  ];
  const params = Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value }));
  return { ok: true, data: { rows, params } };
}

export default function UrlParser() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => parse(input), [input]);

  return (
    <ToolLayout
      title={t('tools.urlParser.name')}
      description={t('tools.urlParser.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <TextArea
        className={styles.input}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        invalid={result.ok === false}
        placeholder={t('tools.urlParser.placeholder')}
        aria-label={t('common.input')}
      />
      {result.ok === false && <p className={styles.error}>{t('tools.urlParser.invalid')}</p>}

      {result.ok === true && (
        <>
          <div className={styles.results}>
            {result.data.rows.map(({ labelKey, value }) => (
              <div className={styles.row} key={labelKey}>
                <span className={styles.rowLabel}>{t(labelKey)}</span>
                <code className={styles.rowValue}>{value}</code>
                <CopyButton
                  value={value}
                  label={t('common.copy')}
                  copiedLabel={t('common.copied')}
                  disabled={!value}
                />
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <span className={styles.paneLabel}>{t('tools.urlParser.params')}</span>
            {result.data.params.length === 0 ? (
              <p className={styles.hint}>{t('tools.urlParser.noParams')}</p>
            ) : (
              <div className={styles.results}>
                {result.data.params.map(({ key, value }, i) => (
                  <div className={styles.row} key={`${key}-${i}`}>
                    <span className={styles.rowLabel} title={key}>
                      {key}
                    </span>
                    <code className={styles.rowValue}>{value}</code>
                    <CopyButton
                      value={value}
                      label={t('common.copy')}
                      copiedLabel={t('common.copied')}
                      disabled={!value}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
