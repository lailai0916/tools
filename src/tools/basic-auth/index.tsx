import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export default function BasicAuth() {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const encoded = useMemo(() => {
    if (!username && !password) {
      return '';
    }
    return toBase64(`${username}:${password}`);
  }, [username, password]);

  const header = encoded ? `Authorization: Basic ${encoded}` : '';

  const rows: { labelKey: 'tools.basicAuth.header' | 'tools.basicAuth.encoded'; value: string }[] =
    [
      { labelKey: 'tools.basicAuth.header', value: header },
      { labelKey: 'tools.basicAuth.encoded', value: encoded },
    ];

  return (
    <ToolLayout
      title={t('tools.basicAuth.name')}
      description={t('tools.basicAuth.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('tools.basicAuth.username')}</label>
          <TextArea
            className={styles.input}
            rows={1}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('tools.basicAuth.usernamePlaceholder')}
            aria-label={t('tools.basicAuth.username')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('tools.basicAuth.password')}</label>
          <TextArea
            className={styles.input}
            rows={1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('tools.basicAuth.passwordPlaceholder')}
            aria-label={t('tools.basicAuth.password')}
          />
        </div>
      </div>

      <div className={styles.results}>
        {rows.map(({ labelKey, value }) => (
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
