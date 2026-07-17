import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Match = { text: string; index: number };
type Result = { ok: true; matches: Match[] } | { ok: false; error: string } | { ok: null };

function run(pattern: string, flags: string, text: string): Result {
  if (!pattern) {
    return { ok: null };
  }
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  const matches: Match[] = [];
  for (const m of text.matchAll(regex)) {
    matches.push({ text: m[0], index: m.index ?? 0 });
    if (m[0] === '') {
      regex.lastIndex++;
    }
  }
  return { ok: true, matches };
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
        <div className={styles.flags}>
          {FLAGS.map((flag) => (
            <Button
              key={flag}
              size="sm"
              active={flags.includes(flag)}
              onClick={() => toggleFlag(flag)}
            >
              {flag}
            </Button>
          ))}
        </div>
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
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.regexTester.pattern')}</label>
        <TextArea
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          invalid={result.ok === false}
          placeholder={t('tools.regexTester.patternPlaceholder')}
          aria-label={t('tools.regexTester.pattern')}
          className={styles.pattern}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.regexTester.testText')}</label>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('tools.regexTester.textPlaceholder')}
          aria-label={t('tools.regexTester.testText')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>
          {t('tools.regexTester.matches')}
          {result.ok === true && <span className={styles.count}>{matches.length}</span>}
        </label>
        {result.ok === true &&
          (matches.length > 0 ? (
            <ul className={styles.list}>
              {matches.map((m, i) => (
                <li key={i} className={styles.item}>
                  <span className={styles.matchText}>{m.text}</span>
                  <span className={styles.pos}>
                    {t('tools.regexTester.at')} {m.index}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('tools.regexTester.noMatch')}</p>
          ))}
      </div>
    </ToolLayout>
  );
}
