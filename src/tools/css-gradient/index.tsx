import { ToolPane } from '@/components/ToolWorkspace';
import { Slider, TextField } from '@lailai0916/ui';
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
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.cssGradient.color1')}
          className={styles.color}
          type="color"
          value={color1}
          onChange={(e) => setColor1(e.target.value)}
          aria-label={t('tools.cssGradient.color1')}
        />
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.cssGradient.color2')}
          className={styles.color}
          type="color"
          value={color2}
          onChange={(e) => setColor2(e.target.value)}
          aria-label={t('tools.cssGradient.color2')}
        />
        <Slider
          className={styles.rangeField}
          label={t('tools.cssGradient.angle')}
          valueLabel={`${angle}°`}
          value={angle}
          min={0}
          max={360}
          onChange={setAngle}
        />
      </div>

      <ToolPane title={t('tools.cssGradient.preview')}>
        <div
          className={styles.preview}
          style={{ backgroundImage: gradient }}
          aria-label={t('tools.cssGradient.preview')}
        />
      </ToolPane>

      <ToolPane
        title={t('tools.cssGradient.output')}
        actions={
          <CopyButton value={css} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <code className={styles.output}>{css}</code>
      </ToolPane>
    </ToolLayout>
  );
}
