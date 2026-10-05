import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Badge, Button } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { diffLines } from 'diff';
import ToolLayout from '@/components/ToolLayout';
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

  const hasInput = original !== '' || modified !== '';
  const noChange = hasInput && lines.every((l) => l.type === 'same');
  const copyText = lines.map((l) => SIGN[l.type] + (l.text ? ' ' + l.text : '')).join('\n');

  return (
    <ToolLayout
      title={t('tools.textDiff.name')}
      description={t('tools.textDiff.description')}
      backLabel={t('common.back')}
    >
      <ToolGrid>
        <ToolPane
          title={<label htmlFor="diff-original">{t('tools.textDiff.original')}</label>}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setOriginal('')} disabled={!original}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            id="diff-original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={t('tools.textDiff.originalPlaceholder')}
            aria-label={t('tools.textDiff.original')}
          />
        </ToolPane>
        <ToolPane
          title={<label htmlFor="diff-modified">{t('tools.textDiff.modified')}</label>}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setModified('')} disabled={!modified}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            id="diff-modified"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder={t('tools.textDiff.modifiedPlaceholder')}
            aria-label={t('tools.textDiff.modified')}
          />
        </ToolPane>
      </ToolGrid>

      <ToolPane
        title={
          <>
            {t('common.output')}
            {hasInput && !noChange && (
              <>
                <Badge>{`+${lines.filter((l) => l.type === 'add').length}`}</Badge>
                <Badge>{`−${lines.filter((l) => l.type === 'del').length}`}</Badge>
              </>
            )}
          </>
        }
        actions={
          <CopyButton
            value={hasInput ? copyText : ''}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        }
      >
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
      </ToolPane>
    </ToolLayout>
  );
}
