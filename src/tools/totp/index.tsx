import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, PasswordInput } from '@lailai0916/ui';
import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { cryptoGuides } from '@/content/toolGuides/crypto';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import {
  generateTotpCode,
  getTotpTime,
  parseTotpConfig,
  type TotpConfig,
} from '@/utils/retainedCrypto';
import styles from './styles.module.css';

type CodeResult = { config: TotpConfig; counter: number; value: string };

export default function Totp() {
  const { t } = useI18n();
  const [secret, setSecret] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<CodeResult | null>(null);
  const [failure, setFailure] = useState<{ config: TotpConfig; counter: number } | null>(null);
  const trimmed = secret.trim();
  const config = useMemo(() => {
    if (!trimmed) return null;
    try {
      return parseTotpConfig(trimmed);
    } catch {
      return null;
    }
  }, [trimmed]);
  const period = config?.period ?? 30;
  const { counter, remaining } = getTotpTime(now, period);
  const code = result?.config === config && result.counter === counter ? result.value : '';
  const failed = failure?.config === config && failure.counter === counter;
  const invalid = trimmed !== '' && config === null;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      setNow(Date.now());
      timer = setTimeout(update, 1000 - (Date.now() % 1000));
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    timer = setTimeout(update, 1000 - (Date.now() % 1000));
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    setResult(null);
    setFailure(null);
    if (!config) return;
    let cancelled = false;
    generateTotpCode(config, counter)
      .then((value) => {
        if (!cancelled) setResult({ config, counter, value });
      })
      .catch(() => {
        if (!cancelled) setFailure({ config, counter });
      });
    return () => {
      cancelled = true;
    };
  }, [config, counter, retry]);

  return (
    <ToolLayout
      guide={cryptoGuides.totp}
      title={t('tools.totp.name')}
      description={t('tools.totp.description')}
    >
      <ToolPane title={t('tools.totp.secret')}>
        <PasswordInput
          value={secret}
          onChange={(event) => {
            setNow(Date.now());
            setSecret(event.target.value);
          }}
          invalid={invalid}
          placeholder={t('tools.totp.secretPlaceholder')}
          aria-label={t('tools.totp.secret')}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
        {invalid && (
          <Alert variant="danger" role="alert">
            {t('tools.totp.invalid')}
          </Alert>
        )}
      </ToolPane>
      <p className={styles.empty}>{t('tools.totp.inputNote')}</p>
      {!invalid && (
        <div className={styles.codeCard}>
          <div
            className={styles.codeHead}
            onClickCapture={(event) => {
              if (config && getTotpTime(Date.now(), config.period).counter !== counter) {
                event.preventDefault();
                event.stopPropagation();
                setNow(Date.now());
              }
            }}
          >
            <span className={styles.paneLabel}>{t('tools.totp.code')}</span>
            <CopyButton
              value={code}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={!code}
            />
            {failed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFailure(null);
                  setNow(Date.now());
                  setRetry((value) => value + 1);
                }}
              >
                {t('tools.totp.retry')}
              </Button>
            )}
          </div>
          {failed ? (
            <Alert variant="danger" role="alert">
              {t('common.processingFailed')}
            </Alert>
          ) : (
            <output className={code ? styles.code : styles.empty} aria-live="polite">
              {code || t(config ? 'tools.totp.processing' : 'tools.totp.empty')}
            </output>
          )}
          {config && (
            <span className={styles.expires}>
              {t('tools.totp.expiresIn')} {remaining}
              {t('tools.totp.seconds')}
            </span>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
