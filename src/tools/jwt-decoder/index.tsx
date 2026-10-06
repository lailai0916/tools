import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import {
  inspectJwt,
  RetainedCryptoError,
  type JwtInspection,
  type RetainedCryptoErrorCode,
} from '@/utils/retainedCrypto';
import styles from './styles.module.css';

type Result =
  ({ ok: true } & JwtInspection) | { ok: false; error: RetainedCryptoErrorCode } | { ok: null };

function decode(input: string): Result {
  if (!input.trim()) return { ok: null };
  try {
    return { ok: true, ...inspectJwt(input) };
  } catch (error) {
    return { ok: false, error: error instanceof RetainedCryptoError ? error.code : 'jwtFormat' };
  }
}

export default function JwtDecoder() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => decode(input), [input]);
  const errorKey =
    result.ok === false && ['base64url', 'utf8'].includes(result.error)
      ? 'tools.jwtDecoder.invalidEncoding'
      : result.ok === false && result.error === 'object'
        ? 'tools.jwtDecoder.invalidObject'
        : result.ok === false && result.error === 'number'
          ? 'tools.jwtDecoder.invalidNumber'
          : result.ok === false && result.error === 'claim'
            ? 'tools.jwtDecoder.invalidClaim'
            : 'tools.jwtDecoder.invalid';

  return (
    <ToolLayout
      title={t('tools.jwtDecoder.name')}
      description={t('tools.jwtDecoder.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.controls}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={t('tools.jwtDecoder.placeholder')}
          aria-label={t('common.input')}
        />
        {result.ok === false && <Alert variant="danger">{t(errorKey)}</Alert>}
      </div>

      <p className={styles.note}>{t('tools.jwtDecoder.inputNote')}</p>

      {result.ok === true && (
        <>
          <ToolPane
            title={t('tools.jwtDecoder.header')}
            actions={
              <CopyButton
                key={result.header}
                value={result.header}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            }
          >
            <TextArea value={result.header} readOnly aria-label={t('tools.jwtDecoder.header')} />
          </ToolPane>

          <ToolPane
            title={t('tools.jwtDecoder.payload')}
            actions={
              <CopyButton
                key={result.payload}
                value={result.payload}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            }
          >
            <TextArea value={result.payload} readOnly aria-label={t('tools.jwtDecoder.payload')} />
          </ToolPane>

          <ToolPane title={t('tools.jwtDecoder.signature')}>
            <code className={styles.signature}>{result.signature}</code>
          </ToolPane>

          <p className={styles.note}>{t('tools.jwtDecoder.note')}</p>
        </>
      )}
    </ToolLayout>
  );
}
