import { Alert, Input } from '@lailai0916/ui';
import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Field = 'px' | 'rem' | 'base';

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  return String(Number(n.toFixed(6)));
}

export default function CssUnit() {
  const [base, setBase] = useState('16');
  const [px, setPx] = useState('16');
  const [rem, setRem] = useState('1');
  const [invalid, setInvalid] = useState<Field | null>(null);
  const { t } = useI18n();

  function edit(field: Field, value: string) {
    if (field === 'px') setPx(value);
    else if (field === 'rem') setRem(value);
    else setBase(value);

    const num = parseNumber(value);
    if (num === null || (field === 'base' && num <= 0)) {
      setInvalid(field);
      return;
    }
    setInvalid(null);

    if (field === 'px') {
      const b = parseNumber(base);
      if (b && b > 0) setRem(fmt(num / b));
    } else if (field === 'rem') {
      const b = parseNumber(base);
      if (b && b > 0) setPx(fmt(num * b));
    } else {
      const p = parseNumber(px);
      if (p !== null) setRem(fmt(p / num));
    }
  }

  const fields: { key: Field; label: string; value: string; suffix: string }[] = [
    { key: 'px', label: t('tools.cssUnit.px'), value: px, suffix: 'px' },
    { key: 'rem', label: t('tools.cssUnit.rem'), value: rem, suffix: 'rem' },
  ];

  return (
    <ToolLayout
      title={t('tools.cssUnit.name')}
      description={t('tools.cssUnit.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.field}>
        <label className={styles.label}>{t('tools.cssUnit.base')}</label>
        <div className={styles.inputRow}>
          <Input
            monospace
            spellCheck={false}
            className={styles.input}
            value={base}
            onChange={(e) => edit('base', e.target.value)}
            invalid={invalid === 'base'}
            aria-label={t('tools.cssUnit.base')}
          />
          <span className={styles.suffix}>px</span>
        </div>
        {invalid === 'base' && <Alert variant="danger">{t('tools.cssUnit.invalid')}</Alert>}
      </div>

      <div className={styles.grid}>
        {fields.map((f) => (
          <div className={styles.field} key={f.key}>
            <label className={styles.label}>{f.label}</label>
            <div className={styles.inputRow}>
              <Input
                monospace
                spellCheck={false}
                className={styles.input}
                value={f.value}
                onChange={(e) => edit(f.key, e.target.value)}
                invalid={invalid === f.key}
                aria-label={f.label}
              />
              <span className={styles.suffix}>{f.suffix}</span>
            </div>
            {invalid === f.key && <Alert variant="danger">{t('tools.cssUnit.invalid')}</Alert>}
          </div>
        ))}
      </div>

      <p className={styles.note}>{t('tools.cssUnit.note')}</p>
    </ToolLayout>
  );
}
