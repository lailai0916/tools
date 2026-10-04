import { Checkbox, TextField } from '@lailai0916/ui';
import { Fragment, useState } from 'react';

import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type Bits = [number, number, number];

const ROWS: { key: 'owner' | 'group' | 'other'; labelKey: MessageKey }[] = [
  { key: 'owner', labelKey: 'tools.unixPermission.owner' },
  { key: 'group', labelKey: 'tools.unixPermission.group' },
  { key: 'other', labelKey: 'tools.unixPermission.other' },
];

const COLS: { key: 'read' | 'write' | 'execute'; labelKey: MessageKey; bit: number }[] = [
  { key: 'read', labelKey: 'tools.unixPermission.read', bit: 4 },
  { key: 'write', labelKey: 'tools.unixPermission.write', bit: 2 },
  { key: 'execute', labelKey: 'tools.unixPermission.execute', bit: 1 },
];

function toOctal(bits: Bits): string {
  return bits.join('');
}

function toSymbolic(bits: Bits): string {
  return bits.map((d) => (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-')).join('');
}

export default function UnixPermission() {
  const { t } = useI18n();
  const [bits, setBits] = useState<Bits>([6, 4, 4]);
  const [octalText, setOctalText] = useState('644');

  function apply(next: Bits) {
    setBits(next);
    setOctalText(toOctal(next));
  }

  function toggle(row: number, bit: number) {
    const next = [...bits] as Bits;
    next[row] ^= bit;
    apply(next);
  }

  function editOctal(value: string) {
    setOctalText(value);
    if (/^[0-7]{3}$/.test(value)) {
      apply([Number(value[0]), Number(value[1]), Number(value[2])]);
    }
  }

  const octalValid = /^[0-7]{3}$/.test(octalText);
  const octal = toOctal(bits);
  const symbolic = toSymbolic(bits);

  return (
    <ToolLayout
      title={t('tools.unixPermission.name')}
      description={t('tools.unixPermission.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.grid}>
        <span className={styles.corner} />
        {COLS.map((c) => (
          <span key={c.key} className={styles.colHead}>
            {t(c.labelKey)}
          </span>
        ))}
        {ROWS.map((r, ri) => (
          <Fragment key={r.key}>
            <span className={styles.rowHead}>{t(r.labelKey)}</span>
            {COLS.map((c) => (
              <Checkbox
                className={styles.cell}
                key={c.key}
                checked={(bits[ri] & c.bit) !== 0}
                onChange={() => toggle(ri, c.bit)}
                aria-label={`${t(r.labelKey)} ${t(c.labelKey)}`}
                label={''}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <TextField
        wrapperClassName={styles.field}
        label={t('tools.unixPermission.octalInput')}
        id="unix-octal-input"
        type="text"
        inputMode="numeric"
        maxLength={3}
        invalid={!octalValid}
        value={octalText}
        onChange={(e) => editOctal(e.target.value)}
        placeholder="644"
        aria-label={t('tools.unixPermission.octalInput')}
      />

      <div className={styles.results}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tools.unixPermission.octal')}</span>
          <code className={styles.rowValue}>{octal}</code>
          <CopyButton value={octal} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tools.unixPermission.symbolic')}</span>
          <code className={styles.rowValue}>{symbolic}</code>
          <CopyButton value={symbolic} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
      </div>
    </ToolLayout>
  );
}
