import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Badge, Button, Hint, TextAreaField, Input } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Match = { text: string; index: number; groups: string[] };
type Result =
  { ok: true; matches: Match[]; truncated: boolean } | { ok: false; error: string } | { ok: null };

const MAX_MATCHES = 2000;

function run(pattern: string, flags: string, text: string): Result {
  if (!pattern) {
    return { ok: null };
  }
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  const matches: Match[] = [];
  const scan = flags.includes('g')
    ? text.matchAll(regex)
    : [regex.exec(text)].filter((m) => m !== null);
  for (const m of scan) {
    if (matches.length === MAX_MATCHES) return { ok: true, matches, truncated: true };
    matches.push({ text: m[0], index: m.index ?? 0, groups: m.slice(1) });
  }
  return { ok: true, matches, truncated: false };
}

const FLAGS = ['g', 'i', 'm', 's'] as const;

export default function RegexTester() {
  const { t } = useI18n();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const result = useMemo(() => run(pattern, flags, text), [pattern, flags, text]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const error = result.ok === false ? result.error : '';
  const matches = result.ok === true ? result.matches : [];

  return (
    <ToolLayout
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
        {result.ok === null && <p className={styles.empty}>{t('common.waitingForInput')}</p>}
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
