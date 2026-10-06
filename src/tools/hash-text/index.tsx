import { Alert, Button, PasswordField, Segmented, SelectField } from '@lailai0916/ui';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { ToolPane } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import {
  digestText,
  hmacText,
  type DigestAlgorithm,
  type HmacAlgorithm,
} from '@/utils/curatedCrypto';
import styles from './styles.module.css';

const HASHES: DigestAlgorithm[] = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1', 'MD5', 'CRC32'];
const HMAC_HASHES: HmacAlgorithm[] = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'];
type Result = { source: string; value: string };

export default function HashText() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'hmac' ? 'hmac' : 'digest';
  const algorithms = mode === 'hmac' ? HMAC_HASHES : HASHES;
  const requestedAlgorithm = params.get('algorithm');
  const algorithm = algorithms.find((value) => value === requestedAlgorithm) ?? 'SHA-256';
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const [error, setError] = useState<Result | null>(null);
  const request = useRef(0);
  const source = JSON.stringify([mode, algorithm, message, secret]);
  const output = result?.source === source ? result.value : '';
  const pending = pendingSource === source;
  const errorText = error?.source === source ? error.value : '';

  useEffect(() => {
    request.current += 1;
    setResult(null);
    setPendingSource(null);
    setError(null);
    return () => {
      request.current += 1;
    };
  }, [source]);

  const changeOption = (key: 'mode' | 'algorithm', value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key === 'mode' && value === 'hmac' && !HMAC_HASHES.includes(algorithm as HmacAlgorithm)) {
      next.set('algorithm', 'SHA-256');
    }
    setParams(next, { replace: true });
  };

  const calculate = async () => {
    const id = ++request.current;
    setResult(null);
    setError(null);
    if (mode === 'hmac' && !secret) {
      setError({ source, value: t('tools.hashText.secretRequired') });
      return;
    }
    setPendingSource(source);
    try {
      const value =
        mode === 'hmac'
          ? await hmacText(message, secret, algorithm as HmacAlgorithm)
          : await digestText(message, algorithm);
      if (request.current === id) setResult({ source, value });
    } catch {
      if (request.current === id) setError({ source, value: t('common.processingFailed') });
    } finally {
      if (request.current === id) setPendingSource(null);
    }
  };

  return (
    <ToolLayout title={t('tools.hashText.name')} description={t('tools.hashText.description')}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <span className={styles.label}>{t('tools.hashText.mode')}</span>
          <Segmented<typeof mode>
            value={mode}
            onChange={(value) => changeOption('mode', value)}
            items={[
              { value: 'digest', label: t('tools.hashText.digest') },
              { value: 'hmac', label: t('tools.hashText.hmac') },
            ]}
            size="sm"
            orientation="horizontal"
            stackAt={0}
            ariaLabel={t('tools.hashText.mode')}
          />
        </div>
        <SelectField
          label={t('tools.hashText.algorithm')}
          value={algorithm}
          onChange={(event) => changeOption('algorithm', event.target.value)}
        >
          {algorithms.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
      </div>
      <ToolPane
        title={t('common.input')}
        actions={
          <Button size="sm" variant="ghost" disabled={!message} onClick={() => setMessage('')}>
            {t('common.clear')}
          </Button>
        }
      >
        <TextArea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('tools.hashText.placeholder')}
          aria-label={t('common.input')}
        />
      </ToolPane>
      {mode === 'hmac' && (
        <PasswordField
          label={t('tools.hashText.secret')}
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
          autoComplete="off"
        />
      )}
      <p className={styles.note}>{t('tools.hashText.encodingNote')}</p>
      {mode === 'digest' && ['MD5', 'SHA-1'].includes(algorithm) && (
        <Alert variant="warning">{t('tools.hashText.legacyNote')}</Alert>
      )}
      {algorithm === 'CRC32' && <Alert variant="warning">{t('tools.hashText.crcNote')}</Alert>}
      <ToolPane
        title={mode === 'hmac' ? 'HMAC-' + algorithm : algorithm}
        actions={
          <div className={styles.actions}>
            <Button size="sm" variant="primary" onClick={calculate} disabled={pending}>
              {t(pending ? 'common.processing' : 'tools.hashText.calculate')}
            </Button>
            <CopyButton
              value={output}
              disabled={!output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
        }
      >
        {errorText && (
          <Alert variant="danger" role="alert">
            {errorText}
          </Alert>
        )}
        <output className={styles.hash} aria-live="polite">
          {output || (
            <span className={styles.empty}>
              {t(pending ? 'common.processing' : 'tools.hashText.emptyResult')}
            </span>
          )}
        </output>
      </ToolPane>
    </ToolLayout>
  );
}
