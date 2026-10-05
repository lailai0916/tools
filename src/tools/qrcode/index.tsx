import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Button, ButtonLink, Slider, Segmented } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import ToolLayout from '@/components/ToolLayout';
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
          <Segmented<typeof level>
            value={level}
            onChange={setLevel}
            items={LEVELS.map((lv) => ({ value: lv.value, label: t(lv.label) }))}
            orientation="horizontal"
            size="sm"
            stackAt={0}
            ariaLabel={t('tools.qrcode.errorCorrection')}
          />
        </div>
        <div className={styles.setting}>
          <span className={styles.settingLabel}>{t('tools.qrcode.size')}</span>
          <Segmented<typeof size>
            value={size}
            onChange={setSize}
            items={SIZES.map((value) => ({ value: value, label: String(value) }))}
            orientation="horizontal"
            size="sm"
            stackAt={0}
            ariaLabel={t('tools.qrcode.size')}
          />
        </div>
        <Slider
          className={styles.marginSetting}
          label={t('tools.qrcode.margin')}
          valueLabel={margin}
          value={margin}
          min={0}
          max={8}
          onChange={setMargin}
        />
      </div>

      <ToolGrid>
        <ToolPane
          title={<label htmlFor="qrcode-input">{t('common.input')}</label>}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            id="qrcode-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            invalid={!!error}
            placeholder={t('tools.qrcode.placeholder')}
            aria-label={t('common.input')}
          />
          {error && <Alert variant="danger">{error}</Alert>}
        </ToolPane>

        <ToolPane title={t('common.output')}>
          {dataUrl ? (
            <div className={styles.preview}>
              <img className={styles.image} src={dataUrl} alt={t('tools.qrcode.alt')} />
              <div className={styles.downloads}>
                <ButtonLink size="sm" to={dataUrl} download={`qrcode-${size}.png`}>
                  {t('tools.qrcode.downloadPng')}
                </ButtonLink>
                <ButtonLink size="sm" to={svgUrl} download="qrcode.svg">
                  {t('tools.qrcode.downloadSvg')}
                </ButtonLink>
              </div>
            </div>
          ) : (
            <p className={styles.empty}>{t('tools.qrcode.empty')}</p>
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
