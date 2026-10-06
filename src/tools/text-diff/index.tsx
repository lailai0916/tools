import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Badge, Button } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';

import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import {
  DIFF_SIGN,
  TEXT_DIFF_TIMEOUT_MS,
  textDiffCopyText,
  textDiffInputError,
  type TextDiffResult,
} from '@/utils/textDiff';
import styles from './styles.module.css';

type CompletedDiff = { original: string; modified: string; result: TextDiffResult };

export default function TextDiff() {
  const { t } = useI18n();
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [completed, setCompleted] = useState<CompletedDiff | null>(null);

  useEffect(() => {
    if (!original && !modified) return;
    const inputError = textDiffInputError(original, modified);
    if (inputError) {
      setCompleted({ original, modified, result: { ok: false, error: inputError } });
      return;
    }
    let active = true;
    let worker: Worker | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const finish = (result: TextDiffResult) => {
      if (!active) return;
      active = false;
      clearTimeout(timeout);
      worker?.terminate();
      setCompleted({ original, modified, result });
    };
    const start = setTimeout(() => {
      try {
        worker = new Worker(new URL('../../utils/textDiff.worker.ts', import.meta.url), {
          type: 'module',
        });
        worker.onmessage = (event: MessageEvent<TextDiffResult>) => finish(event.data);
        worker.onerror = () => finish({ ok: false, error: 'failed' });
        // Include startup grace; the worker's diff algorithm itself is limited to one second.
        timeout = setTimeout(
          () => finish({ ok: false, error: 'timeout' }),
          TEXT_DIFF_TIMEOUT_MS + 500
        );
        worker.postMessage({ original, modified });
      } catch {
        finish({ ok: false, error: 'failed' });
      }
    }, 120);
    return () => {
      active = false;
      clearTimeout(start);
      clearTimeout(timeout);
      worker?.terminate();
    };
  }, [original, modified]);

  const hasInput = original !== '' || modified !== '';
  // State from a previous input is hidden during the render that starts a new comparison.
  const result =
    completed?.original === original && completed.modified === modified ? completed.result : null;
  const lines = result?.ok ? result.lines : [];
  const pending = hasInput && result === null;
  const error = result?.ok === false ? result.error : null;
  const noChange = hasInput && result?.ok === true && lines.every((line) => line.type === 'same');
  const copyText = result?.ok ? textDiffCopyText(lines) : '';

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
            {hasInput && result?.ok && !noChange && (
              <>
                <Badge>{`+${lines.filter((l) => l.type === 'add').length}`}</Badge>
                <Badge>{`−${lines.filter((l) => l.type === 'del').length}`}</Badge>
              </>
            )}
          </>
        }
        actions={
          <CopyButton value={copyText} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <div className={styles.diff}>
          {!hasInput && <p className={styles.hint}>{t('tools.textDiff.empty')}</p>}
          {pending && <p className={styles.hint}>{t('tools.textDiff.processing')}</p>}
          {error && (
            <Alert variant="danger">
              {t(
                error === 'size'
                  ? 'tools.textDiff.limitError'
                  : error === 'timeout'
                    ? 'tools.textDiff.timeoutError'
                    : 'tools.textDiff.failedError'
              )}
            </Alert>
          )}
          {noChange && <p className={styles.hint}>{t('tools.textDiff.identical')}</p>}
          {hasInput &&
            result?.ok &&
            !noChange &&
            lines.map((line, i) => (
              <div key={i} className={styles[`line_${line.type}`]}>
                <span className={styles.sign}>{DIFF_SIGN[line.type]}</span>
                <span className={styles.text}>{line.text || ' '}</span>
              </div>
            ))}
        </div>
      </ToolPane>
    </ToolLayout>
  );
}
