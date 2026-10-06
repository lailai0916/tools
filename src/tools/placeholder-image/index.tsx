import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, ButtonLink, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { generatorGuides } from '@/content/toolGuides/generator';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import { MAX_IMAGE_DIMENSION, parseImageDimension } from '@/utils/mediaGeneration';
import styles from './styles.module.css';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

function render(w: number, h: number, bg: string, fg: string, label: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  const fontSize = Math.max(12, Math.round(Math.min(w, h) / 8));
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2);
  return canvas.toDataURL('image/png');
}

export default function PlaceholderImage() {
  const { t } = useI18n();
  const [width, setWidth] = useState(String(DEFAULT_WIDTH));
  const [height, setHeight] = useState(String(DEFAULT_HEIGHT));
  const [background, setBackground] = useState('#e2e8f0');
  const [textColor, setTextColor] = useState('#64748b');
  const [text, setText] = useState('');

  const wSize = parseImageDimension(width);
  const hSize = parseImageDimension(height);
  const wValid = wSize !== null;
  const hValid = hSize !== null;
  const dimensionsValid = wValid && hValid;
  const fallbackLabel = dimensionsValid ? `${wSize}×${hSize}` : '';
  const label = text.trim() || fallbackLabel;

  const dataUrl = useMemo(
    () =>
      wSize !== null && hSize !== null ? render(wSize, hSize, background, textColor, label) : '',
    [wSize, hSize, background, textColor, label]
  );

  return (
    <ToolLayout
      guide={generatorGuides.placeholderImage}
      title={t('tools.placeholderImage.name')}
      description={t('tools.placeholderImage.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.placeholderImage.width')}
          id="ph-width"
          className={styles.input}
          type="number"
          min={1}
          max={MAX_IMAGE_DIMENSION}
          step={1}
          value={width}
          invalid={!wValid}
          aria-describedby={!wValid ? 'ph-dimensions-error' : undefined}
          onChange={(e) => setWidth(e.target.value)}
          aria-label={t('tools.placeholderImage.width')}
          monospace
        />
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.placeholderImage.height')}
          id="ph-height"
          className={styles.input}
          type="number"
          min={1}
          max={MAX_IMAGE_DIMENSION}
          step={1}
          value={height}
          invalid={!hValid}
          aria-describedby={!hValid ? 'ph-dimensions-error' : undefined}
          onChange={(e) => setHeight(e.target.value)}
          aria-label={t('tools.placeholderImage.height')}
          monospace
        />
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.placeholderImage.background')}
          id="ph-bg"
          className={styles.color}
          type="color"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          aria-label={t('tools.placeholderImage.background')}
        />
        <TextField
          wrapperClassName={styles.field}
          label={t('tools.placeholderImage.textColor')}
          id="ph-fg"
          className={styles.color}
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          aria-label={t('tools.placeholderImage.textColor')}
        />
        <TextField
          wrapperClassName={styles.fieldWide}
          label={t('tools.placeholderImage.text')}
          className={styles.line}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={fallbackLabel}
          aria-label={t('tools.placeholderImage.text')}
        />
      </div>

      {!dimensionsValid && (
        <Alert id="ph-dimensions-error" variant="danger" role="alert">
          {t('tools.placeholderImage.dimensionError')}
        </Alert>
      )}

      <ToolPane title={t('tools.placeholderImage.preview')}>
        {dataUrl ? (
          <div className={styles.previewBox}>
            <img className={styles.image} src={dataUrl} alt={label} />
          </div>
        ) : (
          <p className={styles.note}>{t('tools.placeholderImage.empty')}</p>
        )}
        {dataUrl ? (
          <ButtonLink size="sm" to={dataUrl} download="placeholder.png">
            {t('tools.placeholderImage.download')}
          </ButtonLink>
        ) : (
          <Button size="sm" disabled>
            {t('tools.placeholderImage.download')}
          </Button>
        )}
      </ToolPane>

      <ToolPane
        title={t('tools.placeholderImage.dataUri')}
        actions={
          <CopyButton
            value={dataUrl}
            disabled={!dataUrl}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        }
      >
        <TextArea value={dataUrl} readOnly aria-label={t('tools.placeholderImage.dataUri')} />
      </ToolPane>
    </ToolLayout>
  );
}
