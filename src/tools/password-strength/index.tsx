import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import SecretInput from '@/components/SecretInput';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Level = 'veryWeak' | 'weak' | 'fair' | 'strong' | 'veryStrong';
type Tone = 'danger' | 'warning' | 'success';

type Analysis = {
  bits: number;
  length: number;
  charsets: string[];
  level: Level;
  tone: Tone;
  crack: { value: number; unitKey: MessageKey } | 'instant' | 'eternity';
};

const YEAR_SECONDS = 31_557_600;
const CENTURY_SECONDS = YEAR_SECONDS * 100;

function humanize(seconds: number): Analysis['crack'] {
  if (!Number.isFinite(seconds) || seconds >= CENTURY_SECONDS * 1000) {
    return 'eternity';
  }
  if (seconds < 1) {
    return 'instant';
  }
  const units: { limit: number; div: number; unitKey: MessageKey }[] = [
    { limit: 60, div: 1, unitKey: 'tools.passwordStrength.unitSeconds' },
    { limit: 3600, div: 60, unitKey: 'tools.passwordStrength.unitMinutes' },
    { limit: 86_400, div: 3600, unitKey: 'tools.passwordStrength.unitHours' },
    { limit: YEAR_SECONDS, div: 86_400, unitKey: 'tools.passwordStrength.unitDays' },
    { limit: CENTURY_SECONDS, div: YEAR_SECONDS, unitKey: 'tools.passwordStrength.unitYears' },
    { limit: Infinity, div: CENTURY_SECONDS, unitKey: 'tools.passwordStrength.unitCenturies' },
  ];
  const unit = units.find((u) => seconds < u.limit)!;
  return { value: Math.max(1, Math.round(seconds / unit.div)), unitKey: unit.unitKey };
}

function analyze(password: string): Analysis {
  const length = password.length;
  const classes: { test: RegExp; size: number; token: string }[] = [
    { test: /[a-z]/, size: 26, token: 'a-z' },
    { test: /[A-Z]/, size: 26, token: 'A-Z' },
    { test: /[0-9]/, size: 10, token: '0-9' },
    { test: /[^a-zA-Z0-9]/, size: 33, token: '!@#' },
  ];
  const present = classes.filter((c) => c.test.test(password));
  const pool = present.reduce((sum, c) => sum + c.size, 0);
  const bits = pool > 0 ? length * Math.log2(pool) : 0;

  let level: Level;
  let tone: Tone;
  if (bits < 28) {
    level = 'veryWeak';
    tone = 'danger';
  } else if (bits < 36) {
    level = 'weak';
    tone = 'danger';
  } else if (bits < 60) {
    level = 'fair';
    tone = 'warning';
  } else if (bits < 128) {
    level = 'strong';
    tone = 'success';
  } else {
    level = 'veryStrong';
    tone = 'success';
  }

  const seconds = Math.pow(2, bits) / 1e10;
  return {
    bits,
    length,
    charsets: present.map((c) => c.token),
    level,
    tone,
    crack: humanize(seconds),
  };
}

export default function PasswordStrength() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const analysis = useMemo(() => analyze(password), [password]);
  const empty = password.length === 0;

  const meterWidth = empty ? 0 : Math.min(100, (analysis.bits / 128) * 100);

  function crackText(): string {
    if (analysis.crack === 'instant') {
      return t('tools.passwordStrength.crackInstant');
    }
    if (analysis.crack === 'eternity') {
      return t('tools.passwordStrength.crackEternity');
    }
    return `${analysis.crack.value} ${t(analysis.crack.unitKey)}`;
  }

  const rows: { labelKey: MessageKey; value: string }[] = [
    { labelKey: 'tools.passwordStrength.entropy', value: `${analysis.bits.toFixed(1)}` },
    { labelKey: 'tools.passwordStrength.length', value: `${analysis.length}` },
    {
      labelKey: 'tools.passwordStrength.charsets',
      value: analysis.charsets.length ? analysis.charsets.join(' · ') : '—',
    },
    { labelKey: 'tools.passwordStrength.crackTime', value: crackText() },
  ];

  return (
    <ToolLayout
      title={t('tools.passwordStrength.name')}
      description={t('tools.passwordStrength.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Button size="sm" variant="ghost" onClick={() => setPassword('')} disabled={empty}>
            {t('common.clear')}
          </Button>
        </div>
        <SecretInput
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('tools.passwordStrength.placeholder')}
          aria-label={t('common.input')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
      </div>

      {empty ? (
        <p className={styles.empty}>{t('tools.passwordStrength.empty')}</p>
      ) : (
        <>
          <div className={styles.meterWrap}>
            <div className={styles.meterHead}>
              <span className={styles.paneLabel}>{t('tools.passwordStrength.strength')}</span>
              <span className={styles.strength} data-tone={analysis.tone}>
                {t(`tools.passwordStrength.${analysis.level}` as MessageKey)}
              </span>
            </div>
            <div className={styles.meterTrack}>
              <div
                className={styles.meterFill}
                data-tone={analysis.tone}
                style={{ width: `${meterWidth}%` }}
              />
            </div>
          </div>

          <div className={styles.rows}>
            {rows.map(({ labelKey, value }) => (
              <div className={styles.row} key={labelKey}>
                <span className={styles.rowLabel}>{t(labelKey)}</span>
                <code className={styles.rowValue}>{value}</code>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
