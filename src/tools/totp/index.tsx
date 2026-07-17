import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const PERIOD = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array | null {
  const clean = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  if (!clean) {
    return null;
  }
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      return null;
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function generateTotp(secret: Uint8Array, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, buffer));
  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

export default function Totp() {
  const { t } = useI18n();
  const [secret, setSecret] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [code, setCode] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const trimmed = secret.trim();
  const secretBytes = useMemo(() => (trimmed ? base32Decode(trimmed) : null), [trimmed]);
  const epochSeconds = Math.floor(now / 1000);
  const counter = Math.floor(epochSeconds / PERIOD);
  const remaining = PERIOD - (epochSeconds % PERIOD);

  useEffect(() => {
    if (!secretBytes || secretBytes.length === 0) {
      setCode('');
      return;
    }
    let cancelled = false;
    generateTotp(secretBytes, counter).then((result) => {
      if (!cancelled) {
        setCode(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [secretBytes, counter]);

  const invalid = trimmed !== '' && (secretBytes === null || secretBytes.length === 0);

  return (
    <ToolLayout
      title={t('tools.totp.name')}
      description={t('tools.totp.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.totp.secret')}</label>
        <TextArea
          className={styles.input}
          rows={1}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          invalid={invalid}
          placeholder={t('tools.totp.secretPlaceholder')}
          aria-label={t('tools.totp.secret')}
        />
        {invalid && <p className={styles.error}>{t('tools.totp.invalid')}</p>}
      </div>

      {!invalid && (
        <div className={styles.codeCard}>
          <div className={styles.codeHead}>
            <span className={styles.paneLabel}>{t('tools.totp.code')}</span>
            <CopyButton
              value={code}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={!code}
            />
          </div>
          {code ? (
            <>
              <output className={styles.code}>{code}</output>
              <span className={styles.expires}>
                {t('tools.totp.expiresIn')} {remaining}
                {t('tools.totp.seconds')}
              </span>
            </>
          ) : (
            <output className={styles.empty}>{t('tools.totp.empty')}</output>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
