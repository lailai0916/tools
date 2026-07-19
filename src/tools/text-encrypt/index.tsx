import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import SecretInput from '@/components/SecretInput';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'encrypt' | 'decrypt';

const SALT_BYTES = 16;
const IV_BYTES = 12;
const ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text.trim());
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(text: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text)
  );
  const cipherBytes = new Uint8Array(cipher);
  const packed = new Uint8Array(SALT_BYTES + IV_BYTES + cipherBytes.length);
  packed.set(salt, 0);
  packed.set(iv, SALT_BYTES);
  packed.set(cipherBytes, SALT_BYTES + IV_BYTES);
  return bytesToBase64(packed);
}

async function decryptText(cipherText: string, passphrase: string): Promise<string> {
  const packed = base64ToBytes(cipherText);
  if (packed.length <= SALT_BYTES + IV_BYTES) {
    throw new Error('malformed');
  }
  const salt = packed.slice(0, SALT_BYTES);
  const iv = packed.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const data = packed.slice(SALT_BYTES + IV_BYTES);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

export default function TextEncrypt() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('encrypt');
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!text || !passphrase) {
      setOutput('');
      setError(false);
      return;
    }
    let cancelled = false;
    const run = mode === 'encrypt' ? encryptText(text, passphrase) : decryptText(text, passphrase);
    run
      .then((result) => {
        if (!cancelled) {
          setOutput(result);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOutput('');
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, text, passphrase]);

  const waiting = !text || !passphrase;

  return (
    <ToolLayout
      title={t('tools.textEncrypt.name')}
      description={t('tools.textEncrypt.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'encrypt'} onClick={() => setMode('encrypt')}>
            {t('tools.textEncrypt.encrypt')}
          </Button>
          <Button size="sm" active={mode === 'decrypt'} onClick={() => setMode('decrypt')}>
            {t('tools.textEncrypt.decrypt')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          invalid={error}
          placeholder={
            mode === 'encrypt'
              ? t('tools.textEncrypt.textPlaceholder')
              : t('tools.textEncrypt.cipherPlaceholder')
          }
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('tools.textEncrypt.passphrase')}</label>
        <SecretInput
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          invalid={error}
          placeholder={t('tools.textEncrypt.passphrasePlaceholder')}
          aria-label={t('tools.textEncrypt.passphrase')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
        {error && <p className={styles.error}>{t('tools.textEncrypt.error')}</p>}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea
          value={waiting ? '' : output}
          readOnly
          placeholder={t('tools.textEncrypt.empty')}
          aria-label={t('common.output')}
        />
      </div>
    </ToolLayout>
  );
}
