import { ToolPane } from '@/components/ToolWorkspace';
import { Button, PasswordInput, Segmented } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
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

      <ToolPane title={t('tools.hmacGenerator.secret')}>
        <PasswordInput
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder={t('tools.hmacGenerator.secretPlaceholder')}
          aria-label={t('tools.hmacGenerator.secret')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
      </ToolPane>

      <ToolPane title={t('tools.hmacGenerator.algorithm')}>
        <Segmented<typeof algorithm>
          value={algorithm}
          onChange={setAlgorithm}
          items={ALGORITHMS.map((algo) => ({ value: algo, label: String(algo) }))}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.options')}
        />
      </ToolPane>

      <ToolPane
        title={t('tools.hmacGenerator.output')}
        actions={
          <CopyButton value={digest} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <output className={styles.hash}>
          {digest || <span className={styles.empty}>{t('tools.hmacGenerator.empty')}</span>}
        </output>
      </ToolPane>
    </ToolLayout>
  );
}
