import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Level = 'L' | 'M' | 'Q' | 'H';

const LEVELS: { value: Level; label: MessageKey }[] = [
  { value: 'L', label: 'tools.qrcode.level.L' },
  { value: 'M', label: 'tools.qrcode.level.M' },
  { value: 'Q', label: 'tools.qrcode.level.Q' },
  { value: 'H', label: 'tools.qrcode.level.H' },
];

export default function QrCode() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<Level>('M');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const text = input.trim();
    if (!text) {
      setDataUrl('');
      setError('');
      return;
    }
    let active = true;
    QRCode.toDataURL(text, {
      errorCorrectionLevel: level,
      margin: 2,
      width: 512,
    })
      .then((url) => {
        if (!active) return;
        setDataUrl(url);
        setError('');
      })
      .catch((e: unknown) => {
        if (!active) return;
        setDataUrl('');
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      active = false;
    };
  }, [input, level]);

  return (
    <ToolLayout
      title={t('tools.qrcode.name')}
      description={t('tools.qrcode.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.levels}>
          {LEVELS.map((lv) => (
            <Button
              key={lv.value}
              size="sm"
              active={level === lv.value}
              onClick={() => setLevel(lv.value)}
            >
              {t(lv.label)}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
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
            <a className={styles.download} href={dataUrl} download="qrcode.png">
              {t('tools.qrcode.download')}
            </a>
          </div>
        ) : (
          <p className={styles.empty}>{t('tools.qrcode.empty')}</p>
        )}
      </div>
    </ToolLayout>
  );
}
