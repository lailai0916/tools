import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type BaseKey = 'bin' | 'oct' | 'dec' | 'hex';

const BASES: { key: BaseKey; base: number; labelKey: MessageKey; pattern: RegExp }[] = [
  { key: 'bin', base: 2, labelKey: 'tools.baseConverter.binary', pattern: /^-?[01]+$/ },
  { key: 'oct', base: 8, labelKey: 'tools.baseConverter.octal', pattern: /^-?[0-7]+$/ },
  { key: 'dec', base: 10, labelKey: 'tools.baseConverter.decimal', pattern: /^-?[0-9]+$/ },
  {
    key: 'hex',
    base: 16,
    labelKey: 'tools.baseConverter.hexadecimal',
    pattern: /^-?[0-9a-fA-F]+$/,
  },
];

type Fields = Record<BaseKey, string>;

const EMPTY: Fields = { bin: '', oct: '', dec: '', hex: '' };

function parseBigInteger(value: string, base: number): bigint {
  const trimmed = value.trim();
  const negative = trimmed.startsWith('-');
  const digits = negative ? trimmed.slice(1) : trimmed;
  let result = 0n;
  for (const char of digits.toLowerCase()) {
    const digit = char >= 'a' ? char.charCodeAt(0) - 87 : Number(char);
    result = result * BigInt(base) + BigInt(digit);
  }
  return negative ? -result : result;
}

export default function BaseConverter() {
  const { t } = useI18n();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [invalid, setInvalid] = useState<BaseKey | null>(null);

  const handleChange = (source: BaseKey, base: number, pattern: RegExp, value: string) => {
    if (value.trim() === '') {
      setFields(EMPTY);
      setInvalid(null);
      return;
    }
    if (!pattern.test(value.trim())) {
      setFields((prev) => ({ ...prev, [source]: value }));
      setInvalid(source);
      return;
    }
    const num = parseBigInteger(value, base);
    const next: Fields = { bin: '', oct: '', dec: '', hex: '' };
    for (const b of BASES) {
      next[b.key] = b.key === source ? value : num.toString(b.base);
    }
    setFields(next);
    setInvalid(null);
  };

  return (
    <ToolLayout
      title={t('tools.baseConverter.name')}
      description={t('tools.baseConverter.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFields(EMPTY);
            setInvalid(null);
          }}
          disabled={!fields.bin && !fields.oct && !fields.dec && !fields.hex}
        >
          {t('common.clear')}
        </Button>
      </div>

      {BASES.map((b) => (
        <div key={b.key} className={styles.pane}>
          <div className={styles.paneHead}>
            <label className={styles.paneLabel}>{t(b.labelKey)}</label>
            <CopyButton
              value={fields[b.key]}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
            />
          </div>
          <TextArea
            value={fields[b.key]}
            onChange={(e) => handleChange(b.key, b.base, b.pattern, e.target.value)}
            invalid={invalid === b.key}
            rows={1}
            placeholder={t(b.labelKey)}
            aria-label={t(b.labelKey)}
          />
          {invalid === b.key && <p className={styles.error}>{t('tools.baseConverter.invalid')}</p>}
        </div>
      ))}
    </ToolLayout>
  );
}
