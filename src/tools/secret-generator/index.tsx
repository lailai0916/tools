import { Alert, Button, Checkbox, Segmented, TextAreaField, TextField } from '@lailai0916/ui';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { curatedCryptoGuides } from '@/content/toolGuides/curatedCrypto';
import { ToolPane } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import { generateSecrets, type SecretPurpose, type SecretResult } from '@/utils/curatedCrypto';
import styles from './styles.module.css';

const PURPOSES: SecretPurpose[] = ['password', 'token', 'custom'];
const DEFAULT_LENGTHS = { password: '16', token: '32', custom: '32' };
const CLASSES = [
  { key: 'uppercase', label: 'tools.secretGenerator.uppercase' },
  { key: 'lowercase', label: 'tools.secretGenerator.lowercase' },
  { key: 'digits', label: 'tools.secretGenerator.digits' },
  { key: 'symbols', label: 'tools.secretGenerator.symbols' },
] as const;
const integer = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) &&
  Number.isInteger(Number(value)) &&
  Number(value) >= min &&
  Number(value) <= max;

export default function SecretGenerator() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const purpose = PURPOSES.find((value) => value === params.get('purpose')) ?? 'password';
  const length = params.get('length') ?? DEFAULT_LENGTHS[purpose];
  const count = params.get('count') ?? '1';
  const [classes, setClasses] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [alphabet, setAlphabet] = useState(() => params.get('alphabet') ?? '0123456789abcdef');
  const source = JSON.stringify([purpose, length, count, classes, alphabet]);
  const [result, setResult] = useState<{ source: string; output: SecretResult } | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const output = result?.source === source ? result.output : null;
  const countValid = integer(count, 1, 100);
  const lengthValid =
    purpose === 'password'
      ? integer(length, 4, 128)
      : purpose === 'token'
        ? integer(length, 1, 512)
        : integer(length, 1, 4096);
  const noClasses = purpose === 'password' && !CLASSES.some((item) => classes[item.key]);
  const emptyAlphabet = purpose === 'custom' && !alphabet;
  const parameterError = !countValid
    ? t('tools.secretGenerator.countError')
    : !lengthValid
      ? t(
          purpose === 'password'
            ? 'tools.secretGenerator.passwordLengthError'
            : purpose === 'token'
              ? 'tools.secretGenerator.tokenLengthError'
              : 'tools.secretGenerator.customLengthError'
        )
      : noClasses
        ? t('tools.secretGenerator.classesError')
        : emptyAlphabet
          ? t('tools.secretGenerator.alphabetError')
          : '';
  const error = parameterError || (failedSource === source ? t('common.processingFailed') : '');

  const clearOutput = () => {
    setResult(null);
    setFailedSource(null);
  };
  const update = (key: string, value: string) => {
    clearOutput();
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key === 'purpose') next.set('length', DEFAULT_LENGTHS[value as SecretPurpose]);
    setParams(next, { replace: true });
  };
  const generate = () => {
    clearOutput();
    if (parameterError) return;
    try {
      setResult({
        source,
        output: generateSecrets({
          purpose,
          length: Number(length),
          count: Number(count),
          ...classes,
          alphabet,
        }),
      });
    } catch {
      setFailedSource(source);
    }
  };

  return (
    <ToolLayout
      guide={curatedCryptoGuides.secretGenerator}
      title={t('tools.secretGenerator.name')}
      description={t('tools.secretGenerator.description')}
    >
      <div className={styles.field}>
        <span className={styles.label}>{t('tools.secretGenerator.purpose')}</span>
        <Segmented<SecretPurpose>
          value={purpose}
          onChange={(value) => update('purpose', value)}
          items={[
            { value: 'password', label: t('tools.secretGenerator.password') },
            { value: 'token', label: t('tools.secretGenerator.token') },
            { value: 'custom', label: t('tools.secretGenerator.custom') },
          ]}
          size="sm"
          orientation="horizontal"
          stackAt={480}
          ariaLabel={t('tools.secretGenerator.purpose')}
        />
      </div>
      <div className={styles.controls}>
        <TextField
          label={t(
            purpose === 'token'
              ? 'tools.secretGenerator.byteLength'
              : 'tools.secretGenerator.length'
          )}
          type="number"
          min={purpose === 'password' ? 4 : 1}
          max={purpose === 'password' ? 128 : purpose === 'token' ? 512 : 4096}
          step={1}
          value={length}
          invalid={!lengthValid}
          onChange={(event) => update('length', event.target.value)}
        />
        <TextField
          label={t('tools.secretGenerator.count')}
          type="number"
          min={1}
          max={100}
          step={1}
          value={count}
          invalid={!countValid}
          onChange={(event) => update('count', event.target.value)}
        />
      </div>
      {purpose === 'password' && (
        <ToolPane title={t('tools.secretGenerator.charset')}>
          <div className={styles.checks}>
            {CLASSES.map((item) => (
              <Checkbox
                key={item.key}
                checked={classes[item.key]}
                label={t(item.label)}
                onChange={(event) => {
                  clearOutput();
                  setClasses({ ...classes, [item.key]: event.target.checked });
                }}
              />
            ))}
            <Checkbox
              checked={classes.excludeAmbiguous}
              label={t('tools.secretGenerator.excludeAmbiguous')}
              onChange={(event) => {
                clearOutput();
                setClasses({ ...classes, excludeAmbiguous: event.target.checked });
              }}
            />
          </div>
        </ToolPane>
      )}
      {purpose === 'custom' && (
        <TextAreaField
          label={t('tools.secretGenerator.alphabet')}
          value={alphabet}
          rows={2}
          invalid={emptyAlphabet}
          spellCheck={false}
          onChange={(event) => {
            clearOutput();
            setAlphabet(event.target.value);
          }}
        />
      )}
      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}
      <p className={styles.note}>
        {t(
          purpose === 'password'
            ? 'tools.secretGenerator.passwordNote'
            : purpose === 'token'
              ? 'tools.secretGenerator.tokenNote'
              : 'tools.secretGenerator.customNote'
        )}
      </p>
      <ToolPane
        title={purpose === 'token' ? t('tools.secretGenerator.hex') : t('common.output')}
        actions={
          <div className={styles.actions}>
            <Button size="sm" variant="primary" disabled={!!parameterError} onClick={generate}>
              {t('tools.secretGenerator.generate')}
            </Button>
            <CopyButton
              value={output?.values.join('\n') ?? ''}
              disabled={!output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
        }
      >
        {output ? (
          <TextArea
            value={output.values.join('\n')}
            readOnly
            rows={Math.min(12, Math.max(3, Number(count)))}
            aria-label={t('common.output')}
          />
        ) : (
          <p className={styles.note}>{t('tools.secretGenerator.emptyResult')}</p>
        )}
      </ToolPane>
      {purpose === 'token' && output?.base64 && (
        <ToolPane
          title={t('tools.secretGenerator.base64')}
          actions={
            <CopyButton
              value={output.base64.join('\n')}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          }
        >
          <TextArea
            value={output.base64.join('\n')}
            readOnly
            rows={Math.min(12, Math.max(3, Number(count)))}
            aria-label={t('tools.secretGenerator.base64')}
          />
        </ToolPane>
      )}
    </ToolLayout>
  );
}
