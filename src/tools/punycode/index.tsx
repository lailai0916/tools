import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

// RFC 3492 (Punycode) decoder — bounded params.
const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAX_INT = 0x7fffffff;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((BASE - TMIN) * TMAX) >> 1) {
    d = Math.floor(d / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * d) / (d + SKEW));
}

// Maps a basic code point to its digit value (0-35), or BASE if it is not a digit.
function basicToDigit(code: number): number {
  if (code >= 0x30 && code <= 0x39) {
    return code - 0x30 + 26; // '0'-'9' → 26-35
  }
  if (code >= 0x41 && code <= 0x5a) {
    return code - 0x41; // 'A'-'Z' → 0-25
  }
  if (code >= 0x61 && code <= 0x7a) {
    return code - 0x61; // 'a'-'z' → 0-25
  }
  return BASE;
}

function decodeLabel(input: string): string {
  const output: number[] = [];
  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;

  const lastDelim = input.lastIndexOf('-');
  const basicEnd = lastDelim < 0 ? 0 : lastDelim;
  for (let j = 0; j < basicEnd; j++) {
    const code = input.charCodeAt(j);
    if (code >= 0x80) {
      throw new Error('invalid');
    }
    output.push(code);
  }

  let index = basicEnd > 0 ? basicEnd + 1 : 0;
  while (index < input.length) {
    const oldi = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) {
        throw new Error('invalid');
      }
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= BASE || digit > Math.floor((MAX_INT - i) / w)) {
        throw new Error('invalid');
      }
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) {
        break;
      }
      if (w > Math.floor(MAX_INT / (BASE - t))) {
        throw new Error('invalid');
      }
      w *= BASE - t;
    }
    const outLen = output.length + 1;
    bias = adapt(i - oldi, outLen, oldi === 0);
    if (Math.floor(i / outLen) > MAX_INT - n) {
      throw new Error('invalid');
    }
    n += Math.floor(i / outLen);
    i %= outLen;
    output.splice(i, 0, n);
    i++;
  }
  return String.fromCodePoint(...output);
}

function toAscii(host: string): string {
  return new URL('http://' + host).hostname;
}

function toUnicode(host: string): string {
  return host
    .split('.')
    .map((label) => (/^xn--/i.test(label) ? decodeLabel(label.slice(4)) : label))
    .join('.');
}

type Field = 'unicode' | 'ascii';

const INITIAL_UNICODE = 'münchen.de';
const INITIAL_ASCII = 'xn--mnchen-3ya.de';

export default function Punycode() {
  const { t } = useI18n();
  const [unicode, setUnicode] = useState(INITIAL_UNICODE);
  const [ascii, setAscii] = useState(INITIAL_ASCII);
  const [invalid, setInvalid] = useState<Field | null>(null);

  function edit(field: Field, value: string) {
    if (field === 'unicode') {
      setUnicode(value);
    } else {
      setAscii(value);
    }

    if (value.trim() === '') {
      setInvalid(null);
      if (field === 'unicode') {
        setAscii('');
      } else {
        setUnicode('');
      }
      return;
    }

    try {
      if (field === 'unicode') {
        setAscii(toAscii(value.trim()));
      } else {
        setUnicode(toUnicode(value.trim()));
      }
      setInvalid(null);
    } catch {
      setInvalid(field);
    }
  }

  const fields: { key: Field; labelKey: MessageKey; value: string; placeholder: string }[] = [
    {
      key: 'unicode',
      labelKey: 'tools.punycode.unicode',
      value: unicode,
      placeholder: 'münchen.de',
    },
    {
      key: 'ascii',
      labelKey: 'tools.punycode.ascii',
      value: ascii,
      placeholder: 'xn--mnchen-3ya.de',
    },
  ];

  return (
    <ToolLayout
      title={t('tools.punycode.name')}
      description={t('tools.punycode.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        {fields.map((f) => (
          <div key={f.key} className={styles.field}>
            <label className={styles.fieldLabel}>{t(f.labelKey)}</label>
            <TextArea
              className={styles.input}
              rows={1}
              value={f.value}
              onChange={(e) => edit(f.key, e.target.value)}
              invalid={invalid === f.key}
              placeholder={f.placeholder}
              aria-label={t(f.labelKey)}
            />
            {invalid === f.key && <p className={styles.error}>{t('tools.punycode.invalid')}</p>}
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
