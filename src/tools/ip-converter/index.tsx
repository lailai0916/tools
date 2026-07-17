import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

const MAX = 4294967295;

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) {
    return null;
  }
  let n = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const v = Number(part);
    if (v > 255) {
      return null;
    }
    n = n * 256 + v;
  }
  return n >>> 0;
}

function intFromString(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{1,10}$/.test(trimmed)) {
    return null;
  }
  const n = Number(trimmed);
  if (n > MAX) {
    return null;
  }
  return n;
}

function octets(n: number): number[] {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

function intToIp(n: number): string {
  return octets(n).join('.');
}

function toBinary(n: number): string {
  return octets(n)
    .map((o) => o.toString(2).padStart(8, '0'))
    .join('.');
}

function toHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(8, '0');
}

type Field = 'ipv4' | 'integer';

const INITIAL_IP = '192.168.1.1';
const INITIAL_NUM = ipToInt(INITIAL_IP) ?? 0;

export default function IpConverter() {
  const { t } = useI18n();
  const [ipv4, setIpv4] = useState(INITIAL_IP);
  const [integer, setInteger] = useState(String(INITIAL_NUM));
  const [num, setNum] = useState<number | null>(INITIAL_NUM);
  const [invalid, setInvalid] = useState<Field | null>(null);

  function edit(field: Field, value: string) {
    if (field === 'ipv4') {
      setIpv4(value);
    } else {
      setInteger(value);
    }

    if (value.trim() === '') {
      setInvalid(null);
      setNum(null);
      if (field === 'ipv4') {
        setInteger('');
      } else {
        setIpv4('');
      }
      return;
    }

    const parsed = field === 'ipv4' ? ipToInt(value) : intFromString(value);
    if (parsed === null) {
      setInvalid(field);
      return;
    }
    setInvalid(null);
    setNum(parsed);
    if (field !== 'ipv4') {
      setIpv4(intToIp(parsed));
    }
    if (field !== 'integer') {
      setInteger(String(parsed));
    }
  }

  const derived: { labelKey: MessageKey; value: string }[] = [
    { labelKey: 'tools.ipConverter.binary', value: num === null ? '' : toBinary(num) },
    { labelKey: 'tools.ipConverter.hex', value: num === null ? '' : toHex(num) },
  ];

  const fields: { key: Field; labelKey: MessageKey; value: string; placeholder: string }[] = [
    { key: 'ipv4', labelKey: 'tools.ipConverter.ipv4', value: ipv4, placeholder: '192.168.1.1' },
    {
      key: 'integer',
      labelKey: 'tools.ipConverter.integer',
      value: integer,
      placeholder: '3232235777',
    },
  ];

  return (
    <ToolLayout
      title={t('tools.ipConverter.name')}
      description={t('tools.ipConverter.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        {fields.map((f) => (
          <div key={f.key} className={styles.field}>
            <label className={styles.fieldLabel}>{t(f.labelKey)}</label>
            <TextArea
              className={styles.input}
              rows={1}
              value={f.value}
              onChange={(e) => edit(f.key, e.target.value)}
              invalid={invalid === f.key}
              placeholder={f.placeholder}
              aria-label={t(f.labelKey)}
            />
            {invalid === f.key && <p className={styles.error}>{t('tools.ipConverter.invalid')}</p>}
          </div>
        ))}
      </div>

      <div className={styles.results}>
        {derived.map(({ labelKey, value }) => (
          <div className={styles.row} key={labelKey}>
            <span className={styles.rowLabel}>{t(labelKey)}</span>
            <code className={styles.rowValue}>{value}</code>
            <CopyButton
              value={value}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={!value}
            />
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
