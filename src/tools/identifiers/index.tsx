import { Alert, Button, Segmented, DropdownSelectField, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { curatedCryptoGuides } from '@/content/toolGuides/curatedCrypto';
import { ToolPane, ToolResults } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import { generateIdentifiers, inspectUuid, type IdentifierFormat } from '@/utils/curatedCrypto';
import styles from './styles.module.css';

const FORMATS: { value: IdentifierFormat; label: string }[] = [
  { value: 'uuid-v4', label: 'UUID v4' },
  { value: 'uuid-v7', label: 'UUID v7' },
  { value: 'ulid', label: 'ULID' },
  { value: 'nanoid', label: 'NanoID' },
];
const integer = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) &&
  Number.isInteger(Number(value)) &&
  Number(value) >= min &&
  Number(value) <= max;

export default function Identifiers() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'inspect' ? 'inspect' : 'generate';
  const format = FORMATS.find((item) => item.value === params.get('format'))?.value ?? 'uuid-v4';
  const count = params.get('count') ?? '5';
  const length = params.get('length') ?? '21';
  const source = JSON.stringify([format, count, length]);
  const [result, setResult] = useState<{ source: string; values: string[] } | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [inspectInput, setInspectInput] = useState('');
  const values = result?.source === source ? result.values : [];
  const countValid = integer(count, 1, 1000);
  const lengthValid = format !== 'nanoid' || integer(length, 1, 512);
  const error = !countValid
    ? t('tools.identifiers.countError')
    : !lengthValid
      ? t('tools.identifiers.lengthError')
      : failedSource === source
        ? t('common.processingFailed')
        : '';
  const inspection = useMemo(() => {
    if (!inspectInput.trim()) return { value: null, invalid: false };
    try {
      return { value: inspectUuid(inspectInput), invalid: false };
    } catch {
      return { value: null, invalid: true };
    }
  }, [inspectInput]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== 'mode') {
      setResult(null);
      setFailedSource(null);
    }
    setParams(next, { replace: true });
  };
  const generate = () => {
    setResult(null);
    setFailedSource(null);
    if (!countValid || !lengthValid) return;
    try {
      setResult({
        source,
        values: generateIdentifiers({ format, count: Number(count), length: Number(length) }),
      });
    } catch {
      setFailedSource(source);
    }
  };
  const inspectGenerated = (value: string) => {
    setInspectInput(value);
    update('mode', 'inspect');
  };

  return (
    <ToolLayout
      guide={curatedCryptoGuides.identifiers}
      title={t('tools.identifiers.name')}
      description={t('tools.identifiers.description')}
    >
      <Segmented<typeof mode>
        value={mode}
        onChange={(value) => update('mode', value)}
        items={[
          { value: 'generate', label: t('tools.identifiers.generateMode') },
          { value: 'inspect', label: t('tools.identifiers.inspectMode') },
        ]}
        size="sm"
        orientation="horizontal"
        stackAt={0}
        ariaLabel={t('tools.identifiers.mode')}
      />
      {mode === 'generate' ? (
        <>
          <div className={styles.controls}>
            <DropdownSelectField
              label={t('tools.identifiers.format')}
              value={format}
              onValueChange={(value) => update('format', value)}
              options={FORMATS}
            />
            <TextField
              label={t('tools.identifiers.count')}
              type="number"
              min={1}
              max={1000}
              step={1}
              value={count}
              invalid={!countValid}
              onChange={(event) => update('count', event.target.value)}
            />
            {format === 'nanoid' && (
              <TextField
                label={t('tools.identifiers.length')}
                type="number"
                min={1}
                max={512}
                step={1}
                value={length}
                invalid={!lengthValid}
                onChange={(event) => update('length', event.target.value)}
              />
            )}
          </div>
          {error && (
            <Alert variant="danger" role="alert">
              {error}
            </Alert>
          )}
          <p className={styles.note}>
            {t(format === 'nanoid' ? 'tools.identifiers.nanoidNote' : 'tools.identifiers.timeNote')}
          </p>
          <ToolPane
            title={t('common.output')}
            actions={
              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={generate}
                  disabled={!countValid || !lengthValid}
                >
                  {t('tools.identifiers.generate')}
                </Button>
                <CopyButton
                  value={values.join('\n')}
                  disabled={!values.length}
                  label={t('common.copy')}
                  copiedLabel={t('common.copied')}
                />
              </div>
            }
          >
            {values.length ? (
              <div className={styles.list}>
                {values.map((value, index) => (
                  <div className={styles.row} key={index}>
                    <code className={styles.value}>{value}</code>
                    <div className={styles.actions}>
                      <CopyButton
                        value={value}
                        label={t('common.copy')}
                        copiedLabel={t('common.copied')}
                      />
                      {format.startsWith('uuid-') && (
                        <Button size="sm" variant="ghost" onClick={() => inspectGenerated(value)}>
                          {t('tools.identifiers.inspect')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.note}>{t('tools.identifiers.emptyResult')}</p>
            )}
          </ToolPane>
        </>
      ) : (
        <>
          <ToolPane
            title={t('tools.identifiers.inspectInput')}
            actions={
              <Button
                size="sm"
                variant="ghost"
                disabled={!inspectInput}
                onClick={() => setInspectInput('')}
              >
                {t('common.clear')}
              </Button>
            }
          >
            <TextArea
              value={inspectInput}
              onChange={(event) => setInspectInput(event.target.value)}
              rows={3}
              invalid={inspection.invalid}
              aria-label={t('tools.identifiers.inspectInput')}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
            />
            {inspection.invalid && (
              <Alert variant="danger" role="alert">
                {t('tools.identifiers.inspectError')}
              </Alert>
            )}
          </ToolPane>
          <ToolPane title={t('common.output')}>
            {inspection.value ? (
              <ToolResults
                rows={[
                  { label: t('tools.identifiers.canonical'), value: inspection.value.canonical },
                  {
                    label: t('tools.identifiers.version'),
                    value: String(inspection.value.version),
                  },
                  { label: t('tools.identifiers.variant'), value: inspection.value.variant },
                  ...(inspection.value.timestamp
                    ? [
                        {
                          label: t('tools.identifiers.timestamp'),
                          value: inspection.value.timestamp,
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <p className={styles.note}>{t('tools.identifiers.inspectEmpty')}</p>
            )}
          </ToolPane>
        </>
      )}
    </ToolLayout>
  );
}
