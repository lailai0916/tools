import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Badge, Button, Hint, TextAreaField, Input } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { textGuides } from '@/content/toolGuides/text';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

import type { RegexResult } from '@/utils/regex.worker';

const FLAGS = ['g', 'i', 'm', 's'] as const;

export default function RegexTester() {
  const { t } = useI18n();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const [result, setResult] = useState<RegexResult>({ ok: null });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setResult({ ok: null });
    setPending(Boolean(pattern));
    if (!pattern) return;
    let active = true;
    const worker = new Worker(new URL('../../utils/regex.worker.ts', import.meta.url), {
      type: 'module',
    });
    let timeout: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      timeout = setTimeout(() => {
        worker.terminate();
        setResult({ ok: false, error: t('tools.regexTester.timeout') });
        setPending(false);
      }, 1000);
      worker.postMessage({ pattern, flags, text });
    }, 120);
    worker.onmessage = (event: MessageEvent<RegexResult>) => {
      if (!active) return;
      clearTimeout(timeout);
      setResult(event.data);
      setPending(false);
      worker.terminate();
    };
    worker.onerror = () => {
      if (!active) return;
      clearTimeout(timeout);
      setResult({ ok: false, error: t('common.processingFailed') });
      setPending(false);
      worker.terminate();
    };
    return () => {
      active = false;
      clearTimeout(start);
      clearTimeout(timeout);
      worker.terminate();
    };
  }, [pattern, flags, text, t]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const error = result.ok === false ? result.error : '';
  const matches = result.ok === true ? result.matches : [];

  return (
    <ToolLayout
      guide={textGuides.regexTester}
      title={t('tools.regexTester.name')}
      description={t('tools.regexTester.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.flags} role="group" aria-label={t('tools.regexTester.flags')}>
          {FLAGS.map((flag) => (
            <Hint key={flag} label={t(`tools.regexTester.flag.${flag}`)}>
              <Button
                size="sm"
                active={flags.includes(flag)}
                aria-pressed={flags.includes(flag)}
                aria-label={`${flag}: ${t(`tools.regexTester.flag.${flag}`)}`}
                onClick={() => toggleFlag(flag)}
              >
                {flag}
              </Button>
            </Hint>
          ))}
        </div>
      </div>

      <ToolPane
        title={t('tools.regexTester.pattern')}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPattern('');
              setText('');
            }}
            disabled={!pattern && !text}
          >
            {t('common.clear')}
          </Button>
        }
      >
        <Input
          monospace
          spellCheck={false}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          invalid={result.ok === false}
          aria-describedby={error ? 'regex-error' : undefined}
          placeholder={t('tools.regexTester.patternPlaceholder')}
          aria-label={t('tools.regexTester.pattern')}
          className={styles.pattern}
        />
        {error && (
          <Alert id="regex-error" variant="danger" role="alert">
            {error}
          </Alert>
        )}
      </ToolPane>

      <TextAreaField
        monospace
        wrapperClassName={styles.pane}
        label={t('tools.regexTester.testText')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('tools.regexTester.textPlaceholder')}
        aria-label={t('tools.regexTester.testText')}
      />

      <ToolPane
        title={
          <>
            {t('tools.regexTester.matches')}
            {result.ok === true && <Badge count={matches.length} />}
          </>
        }
      >
        {result.ok === null && (
          <p className={styles.empty}>
            {t(pending ? 'common.processing' : 'common.waitingForInput')}
          </p>
        )}
        {result.ok === true && result.truncated && (
          <Alert variant="warning" role="status">
            {t('tools.regexTester.limit')}
          </Alert>
        )}
        {result.ok === true &&
          (matches.length > 0 ? (
            <ul className={styles.list}>
              {matches.map((m, i) => (
                <li key={i} className={styles.item}>
                  <div className={styles.matchCopy}>
                    <span className={styles.matchText}>
                      {m.text || t('tools.regexTester.emptyMatch')}
                    </span>
                    {m.groups.map((group, index) => (
                      <span className={styles.capture} key={index}>
                        ${index + 1}: {group ?? '—'}
                      </span>
                    ))}
                  </div>
                  <span className={styles.pos}>
                    {t('tools.regexTester.at')} {m.index}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('tools.regexTester.noMatch')}</p>
          ))}
      </ToolPane>
    </ToolLayout>
  );
}
