import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const TABLE: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

const VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

const ROMAN_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function toRoman(n: number): string {
  let out = '';
  for (const [v, s] of TABLE) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function fromRoman(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = VALUE[s[i]];
    const next = i + 1 < s.length ? VALUE[s[i + 1]] : 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

type Field = 'arabic' | 'roman';

export default function RomanNumeral() {
  const { t } = useI18n();
  const [arabic, setArabic] = useState('');
  const [roman, setRoman] = useState('');
  const [invalid, setInvalid] = useState<Field | null>(null);

  function edit(field: Field, value: string) {
    if (field === 'arabic') {
      setArabic(value);
    } else {
      setRoman(value);
    }

    if (value.trim() === '') {
      setInvalid(null);
      if (field === 'arabic') {
        setRoman('');
      } else {
        setArabic('');
      }
      return;
    }

    if (field === 'arabic') {
      const n = Number(value.trim());
      if (!Number.isInteger(n) || n < 1 || n > 3999) {
        setInvalid('arabic');
        return;
      }
      setInvalid(null);
      setRoman(toRoman(n));
    } else {
      const up = value.trim().toUpperCase();
      if (!ROMAN_RE.test(up)) {
        setInvalid('roman');
        return;
      }
      setInvalid(null);
      setArabic(String(fromRoman(up)));
    }
  }

  const fields: { key: Field; label: string; value: string; placeholder: string }[] = [
    { key: 'arabic', label: t('tools.romanNumeral.arabic'), value: arabic, placeholder: '2026' },
    { key: 'roman', label: t('tools.romanNumeral.roman'), value: roman, placeholder: 'MMXXVI' },
  ];

  return (
    <ToolLayout
      title={t('tools.romanNumeral.name')}
      description={t('tools.romanNumeral.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        {fields.map((f) => (
          <div key={f.key} className={styles.field}>
            <label className={styles.fieldLabel}>{f.label}</label>
            <TextArea
              className={styles.input}
              rows={1}
              value={f.value}
              onChange={(e) => edit(f.key, e.target.value)}
              invalid={invalid === f.key}
              placeholder={f.placeholder}
              aria-label={f.label}
            />
            {invalid === f.key && <p className={styles.error}>{t('tools.romanNumeral.invalid')}</p>}
          </div>
        ))}
      </div>
      <p className={styles.hint}>{t('tools.romanNumeral.rangeHint')}</p>
    </ToolLayout>
  );
}
