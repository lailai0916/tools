import { ToolPane } from '@/components/ToolWorkspace';
import Hint from '@lailai0916/ui/Hint';
import { Alert, Button, Input } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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
      <ToolPane
        title={t('common.input')}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {t('common.clear')}
            </Button>
          </>
        }
      >
        <Input
          monospace
          spellCheck={false}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={t('tools.urlParser.placeholder')}
          aria-label={t('common.input')}
        />
        {result.ok === false && <Alert variant="danger">{t('tools.urlParser.invalid')}</Alert>}
      </ToolPane>

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
                    <Hint label={key}>
                      <span className={styles.rowLabel}>{key}</span>
                    </Hint>
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
