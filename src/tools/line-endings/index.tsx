import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'lf' | 'crlf' | 'cr';

const EOL: Record<Mode, string> = { lf: '\n', crlf: '\r\n', cr: '\r' };
const MODES: Mode[] = ['lf', 'crlf', 'cr'];

function detect(s: string): Mode | 'mixed' | null {
  const crlf = (s.match(/\r\n/g) ?? []).length;
  const rest = s.replace(/\r\n/g, '');
  const cr = (rest.match(/\r/g) ?? []).length;
  const lf = (rest.match(/\n/g) ?? []).length;
  const kinds = [crlf > 0, cr > 0, lf > 0].filter(Boolean).length;
  if (kinds === 0) {
    return null;
  }
  if (kinds > 1) {
    return 'mixed';
  }
  if (crlf > 0) {
    return 'crlf';
  }
  if (cr > 0) {
    return 'cr';
  }
  return 'lf';
}

function convert(s: string, mode: Mode): string {
  return s.replace(/\r\n|\r|\n/g, EOL[mode]);
}

export default function LineEndings() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('lf');

  const detected = useMemo(() => detect(input), [input]);
  const output = useMemo(() => convert(input, mode), [input, mode]);

  const modeLabel = (m: Mode) =>
    m === 'lf'
      ? t('tools.lineEndings.lf')
      : m === 'crlf'
        ? t('tools.lineEndings.crlf')
        : t('tools.lineEndings.cr');

  const detectedLabel =
    detected === null
      ? '—'
      : detected === 'mixed'
        ? t('tools.lineEndings.mixed')
        : modeLabel(detected);

  return (
    <ToolLayout
      title={t('tools.lineEndings.name')}
      description={t('tools.lineEndings.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          {MODES.map((m) => (
            <Button key={m} size="sm" active={mode === m} onClick={() => setMode(m)}>
              {modeLabel(m)}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.paneHead}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <span className={styles.detected}>
            {t('tools.lineEndings.detected')}
            <span className={styles.badge}>{detectedLabel}</span>
          </span>
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.lineEndings.placeholder')}
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.pane}>
        <div className={styles.paneHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
