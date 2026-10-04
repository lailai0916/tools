import { Checkbox, Slider, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export default function BoxShadow() {
  const { t } = useI18n();
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(6);
  const [blur, setBlur] = useState(18);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.2);
  const [inset, setInset] = useState(false);

  const shadow = useMemo(() => {
    const { r, g, b } = hexToRgb(color);
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    return `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);
  const css = `box-shadow: ${shadow};`;

  const sliders: {
    key: 'offsetX' | 'offsetY' | 'blur' | 'spread';
    value: number;
    set: (n: number) => void;
    min: number;
    max: number;
  }[] = [
    { key: 'offsetX', value: offsetX, set: setOffsetX, min: -50, max: 50 },
    { key: 'offsetY', value: offsetY, set: setOffsetY, min: -50, max: 50 },
    { key: 'blur', value: blur, set: setBlur, min: 0, max: 100 },
    { key: 'spread', value: spread, set: setSpread, min: -50, max: 50 },
  ];

  return (
    <ToolLayout
      title={t('tools.boxShadow.name')}
      description={t('tools.boxShadow.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.grid}>
        {sliders.map((s) => (
          <Slider
            key={s.key}
            label={t(`tools.boxShadow.${s.key}` as MessageKey)}
            valueLabel={`${s.value}px`}
            value={s.value}
            min={s.min}
            max={s.max}
            onChange={s.set}
          />
        ))}
      </div>

      <div className={styles.row}>
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.boxShadow.color')}
          className={styles.color}
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label={t('tools.boxShadow.color')}
        />
        <Slider
          className={styles.rangeField}
          label={t('tools.boxShadow.opacity')}
          valueLabel={opacity.toFixed(2)}
          value={opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={setOpacity}
        />
        <Checkbox
          checked={inset}
          onChange={(e) => setInset(e.target.checked)}
          label={t('tools.boxShadow.inset')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.boxShadow.preview')}</label>
        <div className={styles.stage}>
          <div className={styles.previewBox} style={{ boxShadow: shadow }} />
        </div>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.boxShadow.output')}</label>
          <CopyButton value={css} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <code className={styles.output}>{css}</code>
      </div>
    </ToolLayout>
  );
}
