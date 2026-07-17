import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
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

function alphabetFor(charset: Charset, custom: string): string {
  if (charset === 'custom') {
    return [...new Set([...custom])].join('');
  }
  return PRESETS[charset];
}

function build(lengthS: string, charset: Charset, custom: string): string {
  const alphabet = alphabetFor(charset, custom);
  const len = Number(lengthS.trim());
  if (!alphabet || !Number.isInteger(len) || len < 1) {
    return '';
  }
  const n = Math.min(len, MAX_LENGTH);
  let out = '';
  for (let i = 0; i < n; i++) {
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
        <div className={styles.field}>
          <label htmlFor="rs-length" className={styles.label}>
            {t('tools.randomString.length')}
          </label>
          <input
            id="rs-length"
            type="number"
            min={1}
            max={MAX_LENGTH}
            className={styles.input}
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
              run(e.target.value, charset, custom);
            }}
            aria-label={t('tools.randomString.length')}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>{t('tools.randomString.charset')}</span>
          <div className={styles.group}>
            {CHARSETS.map((cs) => (
              <Button
                key={cs}
                size="sm"
                active={charset === cs}
                onClick={() => {
                  setCharset(cs);
                  run(length, cs, custom);
                }}
              >
                {t(`tools.randomString.${cs}` as MessageKey)}
              </Button>
            ))}
          </div>
        </div>

        {charset === 'custom' && (
          <div className={styles.field}>
            <TextArea
              rows={1}
              value={custom}
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

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.randomString.output')}</label>
          <div className={styles.actions}>
            <Button size="sm" variant="primary" onClick={() => run()}>
              {t('tools.randomString.regenerate')}
            </Button>
            <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
          </div>
        </div>
        <TextArea rows={2} value={output} readOnly aria-label={t('tools.randomString.output')} />
      </div>
    </ToolLayout>
  );
}
