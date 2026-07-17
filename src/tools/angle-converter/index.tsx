import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Unit = 'degrees' | 'radians' | 'gradians' | 'turns';
type Fields = Record<Unit, string>;

const EMPTY: Fields = { degrees: '', radians: '', gradians: '', turns: '' };
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

const UNITS: { key: Unit; labelKey: MessageKey; placeholder: string }[] = [
  { key: 'degrees', labelKey: 'tools.angleConverter.degrees', placeholder: '90' },
  { key: 'radians', labelKey: 'tools.angleConverter.radians', placeholder: '1.5707963268' },
  { key: 'gradians', labelKey: 'tools.angleConverter.gradians', placeholder: '100' },
  { key: 'turns', labelKey: 'tools.angleConverter.turns', placeholder: '0.25' },
];

function fmt(n: number): string {
  if (!Number.isFinite(n)) {
    return '';
  }
  return Number(n.toPrecision(12)).toString();
}

function toDegrees(unit: Unit, n: number): number {
  switch (unit) {
    case 'degrees':
      return n;
    case 'radians':
      return (n * 180) / Math.PI;
    case 'gradians':
      return n * 0.9;
    case 'turns':
      return n * 360;
  }
}

function fromDegrees(unit: Unit, deg: number): number {
  switch (unit) {
    case 'degrees':
      return deg;
    case 'radians':
      return (deg * Math.PI) / 180;
    case 'gradians':
      return deg / 0.9;
    case 'turns':
      return deg / 360;
  }
}

export default function AngleConverter() {
  const { t } = useI18n();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [invalid, setInvalid] = useState<Unit | null>(null);

  function edit(source: Unit, value: string) {
    if (value.trim() === '') {
      setFields(EMPTY);
      setInvalid(null);
      return;
    }
    if (!NUMBER.test(value.trim())) {
      setFields((prev) => ({ ...prev, [source]: value }));
      setInvalid(source);
      return;
    }
    const deg = toDegrees(source, parseFloat(value.trim()));
    const next: Fields = { ...EMPTY };
    for (const u of UNITS) {
      next[u.key] = u.key === source ? value : fmt(fromDegrees(u.key, deg));
    }
    setFields(next);
    setInvalid(null);
  }

  const hasValue = Boolean(fields.degrees || fields.radians || fields.gradians || fields.turns);

  return (
    <ToolLayout
      title={t('tools.angleConverter.name')}
      description={t('tools.angleConverter.description')}
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
          disabled={!hasValue}
        >
          {t('common.clear')}
        </Button>
      </div>

      {UNITS.map((u) => (
        <div key={u.key} className={styles.field}>
          <label className={styles.fieldLabel}>{t(u.labelKey)}</label>
          <TextArea
            className={styles.input}
            rows={1}
            value={fields[u.key]}
            onChange={(e) => edit(u.key, e.target.value)}
            invalid={invalid === u.key}
            placeholder={u.placeholder}
            aria-label={t(u.labelKey)}
          />
          {invalid === u.key && <p className={styles.error}>{t('tools.angleConverter.invalid')}</p>}
        </div>
      ))}
    </ToolLayout>
  );
}
