import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Unit = 'celsius' | 'fahrenheit' | 'kelvin';
type Fields = Record<Unit, string>;

const EMPTY: Fields = { celsius: '', fahrenheit: '', kelvin: '' };
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

const UNITS: { key: Unit; labelKey: MessageKey; placeholder: string }[] = [
  { key: 'celsius', labelKey: 'tools.temperatureConverter.celsius', placeholder: '0' },
  { key: 'fahrenheit', labelKey: 'tools.temperatureConverter.fahrenheit', placeholder: '32' },
  { key: 'kelvin', labelKey: 'tools.temperatureConverter.kelvin', placeholder: '273.15' },
];

function fmt(n: number): string {
  if (!Number.isFinite(n)) {
    return '';
  }
  return Number(n.toPrecision(12)).toString();
}

function toCelsius(unit: Unit, n: number): number {
  switch (unit) {
    case 'celsius':
      return n;
    case 'fahrenheit':
      return (n - 32) * (5 / 9);
    case 'kelvin':
      return n - 273.15;
  }
}

function fromCelsius(unit: Unit, c: number): number {
  switch (unit) {
    case 'celsius':
      return c;
    case 'fahrenheit':
      return c * (9 / 5) + 32;
    case 'kelvin':
      return c + 273.15;
  }
}

export default function TemperatureConverter() {
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
    const celsius = toCelsius(source, parseFloat(value.trim()));
    if (!Number.isFinite(celsius) || celsius < -273.15) {
      setFields((prev) => ({ ...prev, [source]: value }));
      setInvalid(source);
      return;
    }
    const next: Fields = { ...EMPTY };
    for (const u of UNITS) {
      next[u.key] = u.key === source ? value : fmt(fromCelsius(u.key, celsius));
    }
    setFields(next);
    setInvalid(null);
  }

  const hasValue = Boolean(fields.celsius || fields.fahrenheit || fields.kelvin);

  return (
    <ToolLayout
      title={t('tools.temperatureConverter.name')}
      description={t('tools.temperatureConverter.description')}
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
          {invalid === u.key && (
            <p className={styles.error}>{t('tools.temperatureConverter.invalid')}</p>
          )}
        </div>
      ))}
    </ToolLayout>
  );
}
