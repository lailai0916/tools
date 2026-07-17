import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = (typeof ALGORITHMS)[number];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function HmacGenerator() {
  const { t } = useI18n();
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [digest, setDigest] = useState('');

  useEffect(() => {
    if (!message || !secret) {
      setDigest('');
      return;
    }
    let cancelled = false;
    const encoder = new TextEncoder();
    crypto.subtle
      .importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign'])
      .then((key) => crypto.subtle.sign('HMAC', key, encoder.encode(message)))
      .then((signature) => {
        if (!cancelled) {
          setDigest(toHex(signature));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDigest('');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [message, secret, algorithm]);

  return (
    <ToolLayout
      title={t('tools.hmacGenerator.name')}
      description={t('tools.hmacGenerator.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel}>{t('tools.hmacGenerator.message')}</label>
          <Button size="sm" variant="ghost" onClick={() => setMessage('')} disabled={!message}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('tools.hmacGenerator.messagePlaceholder')}
          aria-label={t('tools.hmacGenerator.message')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.hmacGenerator.secret')}</label>
        <TextArea
          className={styles.input}
          rows={1}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder={t('tools.hmacGenerator.secretPlaceholder')}
          aria-label={t('tools.hmacGenerator.secret')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.hmacGenerator.algorithm')}</label>
        <div className={styles.algorithms}>
          {ALGORITHMS.map((algo) => (
            <Button
              key={algo}
              size="sm"
              active={algorithm === algo}
              onClick={() => setAlgorithm(algo)}
            >
              {algo}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.hmacGenerator.output')}</label>
          <CopyButton value={digest} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <output className={styles.hash}>
          {digest || <span className={styles.empty}>{t('tools.hmacGenerator.empty')}</span>}
        </output>
      </div>
    </ToolLayout>
  );
}
