import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import SecretInput from '@/components/SecretInput';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';
type TotpConfig = { secret: Uint8Array; algorithm: Algorithm; digits: number; period: number };

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

function parseConfig(input: string): TotpConfig | null {
  let secretText = input.trim();
  let algorithm: Algorithm = 'SHA-1';
  let digits = 6;
  let period = 30;

  if (/^otpauth:\/\//i.test(secretText)) {
    try {
      const uri = new URL(secretText);
      if (uri.hostname.toLowerCase() !== 'totp') return null;
      secretText = uri.searchParams.get('secret') ?? '';
      const requestedAlgorithm = (uri.searchParams.get('algorithm') ?? 'SHA1')
        .toUpperCase()
        .replace(/^SHA-?/, 'SHA-') as Algorithm;
      if (!['SHA-1', 'SHA-256', 'SHA-512'].includes(requestedAlgorithm)) return null;
      algorithm = requestedAlgorithm;
      const requestedDigits = Number(uri.searchParams.get('digits') ?? 6);
      const requestedPeriod = Number(uri.searchParams.get('period') ?? 30);
      if (
        ![6, 8].includes(requestedDigits) ||
        !Number.isInteger(requestedPeriod) ||
        requestedPeriod < 1
      ) {
        return null;
      }
      digits = requestedDigits;
      period = requestedPeriod;
    } catch {
      return null;
    }
  }

  const decoded = base32Decode(secretText);
  return decoded && decoded.length > 0 ? { secret: decoded, algorithm, digits, period } : null;
}

async function generateTotp(config: TotpConfig, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    config.secret as BufferSource,
    { name: 'HMAC', hash: config.algorithm },
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
  return String(binary % 10 ** config.digits).padStart(config.digits, '0');
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
  const config = useMemo(() => (trimmed ? parseConfig(trimmed) : null), [trimmed]);
  const epochSeconds = Math.floor(now / 1000);
  const period = config?.period ?? 30;
  const counter = Math.floor(epochSeconds / period);
  const remaining = period - (epochSeconds % period);

  useEffect(() => {
    if (!config) {
      setCode('');
      return;
    }
    let cancelled = false;
    generateTotp(config, counter).then((result) => {
      if (!cancelled) {
        setCode(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [config, counter]);

  const invalid = trimmed !== '' && config === null;

  return (
    <ToolLayout
      title={t('tools.totp.name')}
      description={t('tools.totp.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.totp.secret')}</label>
        <SecretInput
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          invalid={invalid}
          placeholder={t('tools.totp.secretPlaceholder')}
          aria-label={t('tools.totp.secret')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
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
