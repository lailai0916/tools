import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, Segmented, TextField, Input } from '@lailai0916/ui';
import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

const MAX_LENGTH = 4096;

const CHARSETS = ['hex', 'alphanumeric', 'base64', 'custom'] as const;
type Charset = (typeof CHARSETS)[number];

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const PRESETS: Record<Exclude<Charset, 'custom'>, string> = {
  hex: '0123456789abcdef',
  alphanumeric: ALPHA + '0123456789',
  base64: ALPHA + '0123456789-_',
};

// Unbiased index in [0, n) via rejection sampling.
function randomBelow(n: number): number {
  const limit = 0x100000000 - (0x100000000 % n);
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % n;
}

function alphabetFor(charset: Charset, custom: string): string[] {
  if (charset === 'custom') {
    return [...new Set([...custom])];
  }
  return [...PRESETS[charset]];
}

function build(lengthS: string, charset: Charset, custom: string): string {
  const alphabet = alphabetFor(charset, custom);
  const len = Number(lengthS.trim());
  if (!alphabet.length || !Number.isInteger(len) || len < 1 || len > MAX_LENGTH) {
    return '';
  }
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[randomBelow(alphabet.length)];
  }
  return out;
}

export default function RandomString() {
  const { t } = useI18n();
  const [length, setLength] = useState('32');
  const [charset, setCharset] = useState<Charset>('hex');
  const [custom, setCustom] = useState('');
  const [output, setOutput] = useState(() => build('32', 'hex', ''));
  const validLength =
    Number.isInteger(Number(length)) && Number(length) >= 1 && Number(length) <= MAX_LENGTH;
  const emptyAlphabet = charset === 'custom' && !custom;
  const error = !validLength
    ? t('tools.randomString.invalidLength')
    : emptyAlphabet
      ? t('tools.randomString.emptyAlphabet')
      : '';

  const run = (lengthS = length, cs = charset, cu = custom) => {
    setOutput(build(lengthS, cs, cu));
  };

  return (
    <ToolLayout
      title={t('tools.randomString.name')}
      description={t('tools.randomString.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.options}>
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.randomString.length')}
          id="rs-length"
          type="number"
          min={1}
          max={MAX_LENGTH}
          value={length}
          invalid={!validLength}
          aria-describedby={!validLength ? 'random-string-error' : undefined}
          onChange={(e) => {
            setLength(e.target.value);
            run(e.target.value, charset, custom);
          }}
          aria-label={t('tools.randomString.length')}
        />

        <div className={styles.field}>
          <span className={styles.label}>{t('tools.randomString.charset')}</span>
          <Segmented<Charset>
            value={charset}
            onChange={(cs) => {
              setCharset(cs);
              run(length, cs, custom);
            }}
            items={CHARSETS.map((cs) => ({
              value: cs,
              label: t(`tools.randomString.${cs}` as MessageKey),
            }))}
            size="sm"
            orientation="horizontal"
            stackAt={0}
            ariaLabel={t('tools.randomString.charset')}
          />
        </div>

        {charset === 'custom' && (
          <div className={styles.field}>
            <Input
              monospace
              spellCheck={false}
              value={custom}
              invalid={emptyAlphabet}
              aria-describedby={emptyAlphabet ? 'random-string-error' : undefined}
              onChange={(e) => {
                setCustom(e.target.value);
                run(length, charset, e.target.value);
              }}
              placeholder={t('tools.randomString.customPlaceholder')}
              aria-label={t('tools.randomString.custom')}
            />
          </div>
        )}
      </div>

      {error && (
        <Alert id="random-string-error" variant="danger" role="alert">
          {error}
        </Alert>
      )}

      <ToolPane
        title={t('tools.randomString.output')}
        actions={
          <div className={styles.actions}>
            <Button size="sm" variant="primary" onClick={() => run()} disabled={!!error}>
              {t('tools.randomString.regenerate')}
            </Button>
            <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
          </div>
        }
      >
        <TextArea
          rows={Math.min(10, Math.max(2, Math.ceil([...output].length / 24)))}
          value={output}
          readOnly
          aria-label={t('tools.randomString.output')}
        />
      </ToolPane>
    </ToolLayout>
  );
}
