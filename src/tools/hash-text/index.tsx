import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = (typeof ALGORITHMS)[number];
type Digests = Record<Algorithm, string>;

const EMPTY: Digests = { 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' };

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function HashText() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [digests, setDigests] = useState<Digests>(EMPTY);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setDigests(EMPTY);
    setFailed(false);
    if (!input) {
      setPending(false);
      return;
    }
    let cancelled = false;
    setPending(true);
    const data = new TextEncoder().encode(input);
    Promise.all(ALGORITHMS.map((algo) => crypto.subtle.digest(algo, data)))
      .then((buffers) => {
        if (cancelled) {
          return;
        }
        const next = { ...EMPTY };
        ALGORITHMS.forEach((algo, i) => {
          next[algo] = toHex(buffers[i]);
        });
        setDigests(next);
        setPending(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setPending(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <ToolLayout
      title={t('tools.hashText.name')}
      description={t('tools.hashText.description')}
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
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.hashText.placeholder')}
          aria-label={t('common.input')}
        />
      </ToolPane>

      {failed && (
        <Alert variant="danger" role="alert">
          {t('common.processingFailed')}
        </Alert>
      )}

      <div className={styles.results}>
        {ALGORITHMS.map((algo) => (
          <div key={algo} className={styles.row}>
            <div className={styles.rowHead}>
              <span className={styles.algo}>{algo}</span>
              <CopyButton
                value={digests[algo]}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            </div>
            <output className={styles.hash}>
              {digests[algo] || (
                <span className={styles.empty}>
                  {t(pending ? 'common.processing' : 'tools.hashText.empty')}
                </span>
              )}
            </output>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
