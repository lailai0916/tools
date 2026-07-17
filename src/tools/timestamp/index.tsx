import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const TIME_ZONE = 'Asia/Shanghai';

const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function formatDate(ms: number): string {
  const parts = dateFormat.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

type Result = { ok: true; output: string } | { ok: false } | { ok: null };

// Digits only → treat as a Unix timestamp (10-digit seconds vs 13-digit ms);
// otherwise parse as an Asia/Shanghai date string and emit seconds/ms.
function tsToDate(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      return { ok: false };
    }
    const ms = trimmed.replace('-', '').length > 10 ? n : n * 1000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) {
      return { ok: false };
    }
    return { ok: true, output: formatDate(ms) };
  }
  return { ok: false };
}

function dateToTs(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: null };
  }
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    return { ok: false };
  }
  const seconds = Math.floor(ms / 1000);
  return { ok: true, output: String(seconds) };
}

export default function Timestamp() {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tsResult = useMemo(() => tsToDate(tsInput), [tsInput]);
  const dateResult = useMemo(() => dateToTs(dateInput), [dateInput]);

  const tsOutput = tsResult.ok === true ? tsResult.output : '';
  const dateOutput = dateResult.ok === true ? dateResult.output : '';

  const nowSeconds = String(Math.floor(now / 1000));

  return (
    <ToolLayout
      title={t('tools.timestamp.name')}
      description={t('tools.timestamp.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.current}>
        <div className={styles.currentHead}>
          <span className={styles.currentLabel}>{t('tools.timestamp.currentLabel')}</span>
          <CopyButton
            value={nowSeconds}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
        <span className={styles.currentValue}>{nowSeconds}</span>
        <span className={styles.currentDate}>{formatDate(now)}</span>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.timestamp.tsInputLabel')}</label>
        <TextArea
          value={tsInput}
          onChange={(e) => setTsInput(e.target.value)}
          invalid={tsResult.ok === false}
          placeholder={t('tools.timestamp.tsPlaceholder')}
          aria-label={t('tools.timestamp.tsInputLabel')}
        />
        {tsResult.ok === false && <p className={styles.error}>{t('tools.timestamp.invalidTs')}</p>}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.timestamp.tsOutputLabel')}</label>
          <CopyButton value={tsOutput} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={tsOutput} readOnly aria-label={t('tools.timestamp.tsOutputLabel')} />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.timestamp.dateInputLabel')}</label>
        <TextArea
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          invalid={dateResult.ok === false}
          placeholder={t('tools.timestamp.datePlaceholder')}
          aria-label={t('tools.timestamp.dateInputLabel')}
        />
        {dateResult.ok === false && (
          <p className={styles.error}>{t('tools.timestamp.invalidDate')}</p>
        )}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.timestamp.dateOutputLabel')}</label>
          <CopyButton
            value={dateOutput}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
        <TextArea value={dateOutput} readOnly aria-label={t('tools.timestamp.dateOutputLabel')} />
      </div>
    </ToolLayout>
  );
}
