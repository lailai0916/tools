import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Alert, Button, ButtonLink, Slider, Segmented } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { generatorGuides } from '@/content/toolGuides/generator';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  generateQrMedia,
  QrCapacityError,
  type QrMedia,
  type QrLevel,
  type QrSize,
} from '@/utils/mediaGeneration';
import styles from './styles.module.css';

type Level = QrLevel;
type Size = QrSize;

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
  const [margin, setMargin] = useState(4);
  const source = JSON.stringify([input, level, size, margin]);
  const [result, setResult] = useState<{ source: string; media: QrMedia } | null>(null);
  const [failure, setFailure] = useState<{ source: string; capacity: boolean } | null>(null);
  const media = result?.source === source ? result.media : null;
  const error =
    failure?.source === source
      ? t(failure.capacity ? 'tools.qrcode.errorCapacity' : 'tools.qrcode.errorGeneration')
      : '';
  const pending = input.length > 0 && !media && !error;

  useEffect(() => {
    if (input.length === 0) return;
    let active = true;
    generateQrMedia(input, { level, margin, size })
      .then((media) => {
        if (!active) return;
        setResult({ source, media });
        setFailure(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setFailure({ source, capacity: e instanceof QrCapacityError });
      });
    return () => {
      active = false;
    };
  }, [input, level, margin, size, source]);

  return (
    <ToolLayout
      guide={generatorGuides.qrcode}
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
          <p className={styles.note}>{t('tools.qrcode.contentHint')}</p>
          {error && (
            <Alert variant="danger" role="alert">
              {error}
            </Alert>
          )}
        </ToolPane>

        <ToolPane title={t('common.output')}>
          {media ? (
            <div className={styles.preview}>
              <img className={styles.image} src={media.png} alt={t('tools.qrcode.alt')} />
              <div className={styles.downloads}>
                <ButtonLink size="sm" to={media.png} download={`qrcode-${size}.png`}>
                  {t('tools.qrcode.downloadPng')}
                </ButtonLink>
                <ButtonLink size="sm" to={media.svg} download="qrcode.svg">
                  {t('tools.qrcode.downloadSvg')}
                </ButtonLink>
              </div>
            </div>
          ) : (
            <p className={styles.empty} role="status">
              {t(pending ? 'common.processing' : 'tools.qrcode.empty')}
            </p>
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
