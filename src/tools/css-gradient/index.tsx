import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function CssGradient() {
  const { t } = useI18n();
  const [color1, setColor1] = useState('#1d9bf0');
  const [color2, setColor2] = useState('#d93838');
  const [angle, setAngle] = useState(90);

  const gradient = useMemo(
    () => `linear-gradient(${angle}deg, ${color1}, ${color2})`,
    [angle, color1, color2]
  );
  const css = `background: ${gradient};`;

  return (
    <ToolLayout
      title={t('tools.cssGradient.name')}
      description={t('tools.cssGradient.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>{t('tools.cssGradient.color1')}</label>
          <input
            className={styles.color}
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
            aria-label={t('tools.cssGradient.color1')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('tools.cssGradient.color2')}</label>
          <input
            className={styles.color}
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
            aria-label={t('tools.cssGradient.color2')}
          />
        </div>
        <div className={styles.rangeField}>
          <label className={styles.label}>
            {t('tools.cssGradient.angle')}
            <span className={styles.value}>{angle}°</span>
          </label>
          <input
            className={styles.range}
            type="range"
            min={0}
            max={360}
            value={angle}
            onInput={(e) => setAngle(Number(e.currentTarget.value))}
            aria-label={t('tools.cssGradient.angle')}
          />
        </div>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.cssGradient.preview')}</label>
        <div
          className={styles.preview}
          style={{ backgroundImage: gradient }}
          aria-label={t('tools.cssGradient.preview')}
        />
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.cssGradient.output')}</label>
          <CopyButton value={css} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <code className={styles.output}>{css}</code>
      </div>
    </ToolLayout>
  );
}
