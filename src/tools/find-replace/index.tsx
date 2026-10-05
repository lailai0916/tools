import { Alert, Checkbox, TextAreaField, Input, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Result = { ok: true; output: string; count: number } | { ok: false; error: string };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function process(
  text: string,
  find: string,
  replace: string,
  useRegex: boolean,
  caseInsensitive: boolean
): Result {
  if (find === '') {
    return { ok: true, output: text, count: 0 };
  }
  const flags = caseInsensitive ? 'gi' : 'g';
  const pattern = useRegex ? find : escapeRegExp(find);
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  // Keep the replacement literal when regex mode is off ($ has no special meaning there).
  const repl = useRegex ? replace : replace.split('$').join('$$');
  const count = [...text.matchAll(re)].length;
  return { ok: true, output: text.replace(re, repl), count };
}

export default function FindReplace() {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);

  const result = useMemo(
    () => process(text, find, replace, useRegex, caseInsensitive),
    [text, find, replace, useRegex, caseInsensitive]
  );

  const output = result.ok ? result.output : '';
  const count = result.ok ? result.count : 0;

  return (
    <ToolLayout
      title={t('tools.findReplace.name')}
      description={t('tools.findReplace.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>{t('tools.findReplace.find')}</label>
          <Input
            monospace
            spellCheck={false}
            className={styles.line}
            value={find}
            onChange={(e) => setFind(e.target.value)}
            invalid={!result.ok}
            placeholder={t('tools.findReplace.findPlaceholder')}
            aria-label={t('tools.findReplace.find')}
          />
          {!result.ok && <Alert variant="danger">{t('tools.findReplace.invalidRegex')}</Alert>}
        </div>
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.findReplace.replace')}
          className={styles.line}
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder={t('tools.findReplace.replacePlaceholder')}
          aria-label={t('tools.findReplace.replace')}
        />
      </div>

      <div className={styles.options}>
        <Checkbox
          checked={useRegex}
          onChange={(e) => setUseRegex(e.target.checked)}
          label={t('tools.findReplace.regex')}
        />
        <Checkbox
          checked={caseInsensitive}
          onChange={(e) => setCaseInsensitive(e.target.checked)}
          label={t('tools.findReplace.caseInsensitive')}
        />
      </div>

      <TextAreaField
        wrapperClassName={styles.pane}
        label={t('common.input')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('tools.findReplace.textPlaceholder')}
        aria-label={t('common.input')}
      />

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <div className={styles.headLeft}>
            <label className={styles.paneLabel}>{t('common.output')}</label>
            <span className={styles.badge}>
              {t('tools.findReplace.matchCount')}
              <span className={styles.count}>{count}</span>
            </span>
          </div>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
