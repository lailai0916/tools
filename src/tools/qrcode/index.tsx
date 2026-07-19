import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Level = 'L' | 'M' | 'Q' | 'H';
type Size = 256 | 512 | 1024;

const LEVELS: { value: Level; label: MessageKey }[] = [
  { value: 'L', label: 'tools.qrcode.level.L' },
  { value: 'M', label: 'tools.qrcode.level.M' },
  { value: 'Q', label: 'tools.qrcode.level.Q' },
  { value: 'H', label: 'tools.qrcode.level.H' },
];
const SIZES: Size[] = [256, 512, 1024];

export default function QrCode() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<Level>('M');
  const [size, setSize] = useState<Size>(512);
  const [margin, setMargin] = useState(2);
  const [dataUrl, setDataUrl] = useState('');
  const [svgUrl, setSvgUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const text = input.trim();
    if (!text) {
      setDataUrl('');
      setSvgUrl('');
      setError('');
      return;
    }
    let active = true;
    const options = { errorCorrectionLevel: level, margin, width: size };
    Promise.all([
      QRCode.toDataURL(text, options),
      QRCode.toString(text, { ...options, type: 'svg' }),
    ])
      .then(([url, svg]) => {
        if (!active) return;
        setDataUrl(url);
        setSvgUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
        setError('');
      })
      .catch((e: unknown) => {
        if (!active) return;
        setDataUrl('');
        setSvgUrl('');
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      active = false;
    };
  }, [input, level, margin, size]);

  return (
    <ToolLayout
      title={t('tools.qrcode.name')}
      description={t('tools.qrcode.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.settings}>
        <div className={styles.setting}>
          <span className={styles.settingLabel}>{t('tools.qrcode.errorCorrection')}</span>
          <div
            className={styles.levels}
            role="group"
            aria-label={t('tools.qrcode.errorCorrection')}
          >
            {LEVELS.map((lv) => (
              <Button
                key={lv.value}
                size="sm"
                active={level === lv.value}
                onClick={() => setLevel(lv.value)}
                aria-pressed={level === lv.value}
              >
                {t(lv.label)}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.setting}>
          <span className={styles.settingLabel}>{t('tools.qrcode.size')}</span>
          <div className={styles.levels} role="group" aria-label={t('tools.qrcode.size')}>
            {SIZES.map((value) => (
              <Button
                key={value}
                size="sm"
                active={size === value}
                onClick={() => setSize(value)}
                aria-pressed={size === value}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.marginSetting}>
          <div className={styles.settingHead}>
            <label className={styles.settingLabel} htmlFor="qrcode-margin">
              {t('tools.qrcode.margin')}
            </label>
            <output className={styles.settingValue} htmlFor="qrcode-margin">
              {margin}
            </output>
          </div>
          <input
            id="qrcode-margin"
            className={styles.range}
            type="range"
            min={0}
            max={8}
            value={margin}
            onInput={(event) => setMargin(Number(event.currentTarget.value))}
          />
        </div>
      </div>

      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel} htmlFor="qrcode-input">
            {t('common.input')}
          </label>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          id="qrcode-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={!!error}
          placeholder={t('tools.qrcode.placeholder')}
          aria-label={t('common.input')}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.output')}</label>
        {dataUrl ? (
          <div className={styles.preview}>
            <img className={styles.image} src={dataUrl} alt={t('tools.qrcode.alt')} />
            <div className={styles.downloads}>
              <a className={styles.download} href={dataUrl} download={`qrcode-${size}.png`}>
                {t('tools.qrcode.downloadPng')}
              </a>
              <a className={styles.download} href={svgUrl} download="qrcode.svg">
                {t('tools.qrcode.downloadSvg')}
              </a>
            </div>
          </div>
        ) : (
          <p className={styles.empty}>{t('tools.qrcode.empty')}</p>
        )}
      </div>
    </ToolLayout>
  );
}
