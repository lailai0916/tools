import { useMemo, useState } from 'react';
import { diffLines } from 'diff';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type LineType = 'add' | 'del' | 'same';
type DiffLine = { type: LineType; text: string };

const SIGN: Record<LineType, string> = { add: '+', del: '-', same: ' ' };

function toLines(value: string): string[] {
  const lines = value.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const changes = diffLines(original, modified);
  const result: DiffLine[] = [];
  for (const change of changes) {
    const type: LineType = change.added ? 'add' : change.removed ? 'del' : 'same';
    for (const text of toLines(change.value)) {
      result.push({ type, text });
    }
  }
  return result;
}

export default function TextDiff() {
  const { t } = useI18n();
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const lines = useMemo(() => computeDiff(original, modified), [original, modified]);

  const hasInput = original.trim() !== '' || modified.trim() !== '';
  const noChange = hasInput && lines.every((l) => l.type === 'same');
  const copyText = lines.map((l) => SIGN[l.type] + (l.text ? ' ' + l.text : '')).join('\n');

  return (
    <ToolLayout
      title={t('tools.textDiff.name')}
      description={t('tools.textDiff.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOriginal('');
            setModified('');
          }}
          disabled={!original && !modified}
        >
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.inputs}>
        <div className={styles.pane}>
          <label className={styles.paneLabel}>{t('tools.textDiff.original')}</label>
          <TextArea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={t('tools.textDiff.originalPlaceholder')}
            aria-label={t('tools.textDiff.original')}
          />
        </div>
        <div className={styles.pane}>
          <label className={styles.paneLabel}>{t('tools.textDiff.modified')}</label>
          <TextArea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder={t('tools.textDiff.modifiedPlaceholder')}
            aria-label={t('tools.textDiff.modified')}
          />
        </div>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={copyText} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <div className={styles.diff}>
          {!hasInput && <p className={styles.hint}>{t('tools.textDiff.empty')}</p>}
          {noChange && <p className={styles.hint}>{t('tools.textDiff.identical')}</p>}
          {hasInput &&
            !noChange &&
            lines.map((line, i) => (
              <div key={i} className={styles[`line_${line.type}`]}>
                <span className={styles.sign}>{SIGN[line.type]}</span>
                <span className={styles.text}>{line.text || ' '}</span>
              </div>
            ))}
        </div>
      </div>
    </ToolLayout>
  );
}
