import { useState, type CSSProperties } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Rgb = { r: number; g: number; b: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseHex(input: string): Rgb | null {
  const s = input.trim().replace(/^#/, '');
  let hex = s;
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    hex = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function parseRgb(input: string): Rgb | null {
  const nums = input.trim().match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length !== 3) {
    return null;
  }
  const [r, g, b] = nums.map(Number);
  if ([r, g, b].some((n) => n < 0 || n > 255)) {
    return null;
  }
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

function parseHsl(input: string): Rgb | null {
  const nums = input.trim().match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length !== 3) {
    return null;
  }
  const [h, s, l] = nums.map(Number);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    return null;
  }
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = ln - c / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function toHexString({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((n) => clamp(n, 0, 255).toString(16).padStart(2, '0')).join('');
}

function toRgbString({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function toHslString(rgb: Rgb): string {
  const { h, s, l } = rgbToHsl(rgb);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

type Field = 'hex' | 'rgb' | 'hsl';

const INITIAL: Rgb = { r: 79, g: 70, b: 229 };

export default function ColorConverter() {
  const { t } = useI18n();
  const [hex, setHex] = useState(() => toHexString(INITIAL));
  const [rgb, setRgb] = useState(() => toRgbString(INITIAL));
  const [hsl, setHsl] = useState(() => toHslString(INITIAL));
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [preview, setPreview] = useState(() => toHexString(INITIAL));

  const current = parseHex(preview) ?? INITIAL;

  function commit(next: Rgb) {
    setHex(toHexString(next));
    setRgb(toRgbString(next));
    setHsl(toHslString(next));
    setPreview(toHexString(next));
    setInvalid(null);
  }

  function edit(field: Field, value: string) {
    if (field === 'hex') {
      setHex(value);
    } else if (field === 'rgb') {
      setRgb(value);
    } else {
      setHsl(value);
    }

    let parsed: Rgb | null;
    switch (field) {
      case 'hex':
        parsed = parseHex(value);
        break;
      case 'rgb':
        parsed = parseRgb(value);
        break;
      case 'hsl':
        parsed = parseHsl(value);
        break;
    }

    if (!parsed) {
      setInvalid(field);
      return;
    }
    commit(parsed);
  }

  function editChannel(channel: keyof Rgb, value: number) {
    commit({ ...current, [channel]: clamp(Math.round(value), 0, 255) });
  }

  const fields: { key: Field; label: string; value: string; placeholder: string }[] = [
    { key: 'hex', label: 'HEX', value: hex, placeholder: '#4f46e5' },
    { key: 'rgb', label: 'RGB', value: rgb, placeholder: 'rgb(79, 70, 229)' },
    { key: 'hsl', label: 'HSL', value: hsl, placeholder: 'hsl(244, 76%, 59%)' },
  ];

  const channels: { key: keyof Rgb; label: string; value: number; gradient: string }[] = [
    {
      key: 'r',
      label: t('tools.colorConverter.red'),
      value: current.r,
      gradient: `linear-gradient(to right, rgb(0, ${current.g}, ${current.b}), rgb(255, ${current.g}, ${current.b}))`,
    },
    {
      key: 'g',
      label: t('tools.colorConverter.green'),
      value: current.g,
      gradient: `linear-gradient(to right, rgb(${current.r}, 0, ${current.b}), rgb(${current.r}, 255, ${current.b}))`,
    },
    {
      key: 'b',
      label: t('tools.colorConverter.blue'),
      value: current.b,
      gradient: `linear-gradient(to right, rgb(${current.r}, ${current.g}, 0), rgb(${current.r}, ${current.g}, 255))`,
    },
  ];

  return (
    <ToolLayout
      title={t('tools.colorConverter.name')}
      description={t('tools.colorConverter.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.layout}>
        <div className={styles.previewWrap}>
          <div
            className={styles.preview}
            style={{ background: preview }}
            aria-label={t('tools.colorConverter.preview')}
          />
          <div className={styles.previewMeta}>
            <span className={styles.previewLabel}>{t('tools.colorConverter.preview')}</span>
            <label className={styles.pickerLabel}>
              <span>{t('tools.colorConverter.pickColor')}</span>
              <input
                type="color"
                className={styles.picker}
                value={preview}
                onChange={(event) => {
                  const next = parseHex(event.target.value);
                  if (next) {
                    commit(next);
                  }
                }}
                aria-label={t('tools.colorConverter.pickColor')}
              />
            </label>
          </div>
        </div>

        <div className={styles.fields}>
          {fields.map((f) => (
            <div key={f.key} className={styles.field}>
              <label className={styles.fieldLabel} htmlFor={`color-${f.key}`}>
                {f.label}
              </label>
              <div className={styles.fieldControl}>
                <TextArea
                  id={`color-${f.key}`}
                  className={styles.input}
                  rows={1}
                  value={f.value}
                  onChange={(e) => edit(f.key, e.target.value)}
                  invalid={invalid === f.key}
                  aria-describedby={invalid === f.key ? `color-${f.key}-error` : undefined}
                  placeholder={f.placeholder}
                  aria-label={f.label}
                />
                <CopyButton
                  value={f.value}
                  label={t('common.copy')}
                  copiedLabel={t('common.copied')}
                />
              </div>
              {invalid === f.key && (
                <p id={`color-${f.key}-error`} className={styles.error} role="alert">
                  {t('tools.colorConverter.invalid')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <section className={styles.adjust} aria-labelledby="color-rgb-heading">
        <div className={styles.adjustHead}>
          <h2 id="color-rgb-heading" className={styles.adjustTitle}>
            {t('tools.colorConverter.adjustRgb')}
          </h2>
          <span className={styles.adjustValue}>{toRgbString(current)}</span>
        </div>
        <div className={styles.sliders}>
          {channels.map((channel) => {
            const id = `color-channel-${channel.key}`;
            return (
              <div key={channel.key} className={styles.sliderRow}>
                <label htmlFor={id} className={styles.channelLabel}>
                  {channel.key.toUpperCase()}
                  <span className={styles.srOnly}>{channel.label}</span>
                </label>
                <input
                  id={id}
                  type="range"
                  className={styles.slider}
                  min={0}
                  max={255}
                  value={channel.value}
                  onInput={(event) => editChannel(channel.key, Number(event.currentTarget.value))}
                  aria-label={channel.label}
                  style={{ '--slider-gradient': channel.gradient } as CSSProperties}
                />
                <output htmlFor={id} className={styles.channelValue}>
                  {channel.value}
                </output>
              </div>
            );
          })}
        </div>
      </section>
    </ToolLayout>
  );
}
