import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;
const MAX_DIMENSION = 4096;

function resolveDimension(value: string, fallback: number): { size: number; valid: boolean } {
  const n = Number(value);
  const valid = Number.isInteger(n) && n >= 1 && n <= MAX_DIMENSION;
  return { size: valid ? n : fallback, valid };
}

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

  const { size: wSize, valid: wValid } = resolveDimension(width, DEFAULT_WIDTH);
  const { size: hSize, valid: hValid } = resolveDimension(height, DEFAULT_HEIGHT);
  const fallbackLabel = `${wSize}×${hSize}`;
  const label = text.trim() || fallbackLabel;

  const dataUrl = useMemo(
    () => render(wSize, hSize, background, textColor, label),
    [wSize, hSize, background, textColor, label]
  );

  return (
    <ToolLayout
      title={t('tools.placeholderImage.name')}
      description={t('tools.placeholderImage.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ph-width">
            {t('tools.placeholderImage.width')}
          </label>
          <input
            id="ph-width"
            className={styles.input}
            type="number"
            min={1}
            max={MAX_DIMENSION}
            value={width}
            data-invalid={!wValid}
            onChange={(e) => setWidth(e.target.value)}
            aria-label={t('tools.placeholderImage.width')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ph-height">
            {t('tools.placeholderImage.height')}
          </label>
          <input
            id="ph-height"
            className={styles.input}
            type="number"
            min={1}
            max={MAX_DIMENSION}
            value={height}
            data-invalid={!hValid}
            onChange={(e) => setHeight(e.target.value)}
            aria-label={t('tools.placeholderImage.height')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ph-bg">
            {t('tools.placeholderImage.background')}
          </label>
          <input
            id="ph-bg"
            className={styles.color}
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            aria-label={t('tools.placeholderImage.background')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ph-fg">
            {t('tools.placeholderImage.textColor')}
          </label>
          <input
            id="ph-fg"
            className={styles.color}
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            aria-label={t('tools.placeholderImage.textColor')}
          />
        </div>
        <div className={styles.fieldWide}>
          <label className={styles.label}>{t('tools.placeholderImage.text')}</label>
          <TextArea
            className={styles.line}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={fallbackLabel}
            aria-label={t('tools.placeholderImage.text')}
          />
        </div>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.placeholderImage.preview')}</label>
        <div className={styles.previewBox}>
          <img className={styles.image} src={dataUrl} alt={label} />
        </div>
        <a className={styles.download} href={dataUrl} download="placeholder.png">
          {t('tools.placeholderImage.download')}
        </a>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.placeholderImage.dataUri')}</label>
          <CopyButton value={dataUrl} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea
          className={styles.uri}
          value={dataUrl}
          readOnly
          aria-label={t('tools.placeholderImage.dataUri')}
        />
      </div>
    </ToolLayout>
  );
}
