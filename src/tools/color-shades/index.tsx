import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Rgb = { r: number; g: number; b: number };

function parseHex(input: string): Rgb | null {
  const s = input.trim().replace(/^#/, '');
  let hex = s;
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    hex = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

function mix(rgb: Rgb, target: number, amount: number): Rgb {
  return {
    r: Math.round(rgb.r + (target - rgb.r) * amount),
    g: Math.round(rgb.g + (target - rgb.g) * amount),
    b: Math.round(rgb.b + (target - rgb.b) * amount),
  };
}

const STEPS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function ramp(base: Rgb, target: number): string[] {
  return STEPS.map((amount) => toHex(mix(base, target, amount)));
}

export default function ColorShades() {
  const { t } = useI18n();
  const [hex, setHex] = useState('#1d9bf0');
  const [color, setColor] = useState('#1d9bf0');
  const [invalid, setInvalid] = useState(false);

  function editHex(value: string) {
    setHex(value);
    const parsed = parseHex(value);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setColor(toHex(parsed));
  }

  function editColor(value: string) {
    setColor(value);
    setHex(value);
    setInvalid(false);
  }

  const base = useMemo(() => parseHex(color) ?? { r: 29, g: 155, b: 240 }, [color]);
  const tints = useMemo(() => ramp(base, 255), [base]);
  const shades = useMemo(() => ramp(base, 0), [base]);

  const rows: { key: 'tints' | 'shades'; label: string; values: string[] }[] = [
    { key: 'tints', label: t('tools.colorShades.tints'), values: tints },
    { key: 'shades', label: t('tools.colorShades.shades'), values: shades },
  ];

  return (
    <ToolLayout
      title={t('tools.colorShades.name')}
      description={t('tools.colorShades.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.field}>
        <label className={styles.label}>{t('tools.colorShades.baseColor')}</label>
        <div className={styles.inputRow}>
          <input
            className={styles.color}
            type="color"
            value={color}
            onChange={(e) => editColor(e.target.value)}
            aria-label={t('tools.colorShades.baseColor')}
          />
          <TextArea
            className={styles.input}
            rows={1}
            value={hex}
            onChange={(e) => editHex(e.target.value)}
            invalid={invalid}
            placeholder="#1d9bf0"
            aria-label={t('tools.colorShades.baseColor')}
          />
        </div>
        {invalid && <p className={styles.error}>{t('tools.colorShades.invalid')}</p>}
      </div>

      {rows.map((row) => (
        <div className={styles.section} key={row.key}>
          <span className={styles.sectionLabel}>{row.label}</span>
          <div className={styles.swatches}>
            {row.values.map((value, i) => (
              <div className={styles.swatch} key={`${row.key}-${i}`}>
                <div className={styles.chip} style={{ background: value }} />
                <code className={styles.hex}>{value}</code>
                <CopyButton
                  className={styles.copy}
                  value={value}
                  label={t('common.copy')}
                  copiedLabel={t('common.copied')}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </ToolLayout>
  );
}
