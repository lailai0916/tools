import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, PasswordInput, TextAreaField, Segmented } from '@lailai0916/ui';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
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
        <Segmented<typeof mode>
          value={mode}
          onChange={setMode}
          items={[
            { value: 'encrypt', label: t('tools.textEncrypt.encrypt') },
            { value: 'decrypt', label: t('tools.textEncrypt.decrypt') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.mode')}
        />
        <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
          {t('common.clear')}
        </Button>
      </div>

      <TextAreaField
        wrapperClassName={styles.pane}
        label={t('common.input')}
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

      <ToolPane title={t('tools.textEncrypt.passphrase')}>
        <PasswordInput
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          invalid={error}
          placeholder={t('tools.textEncrypt.passphrasePlaceholder')}
          aria-label={t('tools.textEncrypt.passphrase')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
        {error && <Alert variant="danger">{t('tools.textEncrypt.error')}</Alert>}
      </ToolPane>

      <ToolPane
        title={t('common.output')}
        actions={
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <TextArea
          value={waiting ? '' : output}
          readOnly
          placeholder={t('tools.textEncrypt.empty')}
          aria-label={t('common.output')}
        />
      </ToolPane>
    </ToolLayout>
  );
}
