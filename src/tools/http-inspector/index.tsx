import { Alert, Button, PasswordInput, Segmented, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  CuratedWebError,
  decodeBasicAuth,
  encodeBasicAuth,
  parseCookies,
  parseHttpHeaders,
} from '@/utils/curatedWeb';
import styles from './styles.module.css';

type Mode = 'headers' | 'cookies' | 'basic-auth';
type Direction = 'encode' | 'decode';
const MODES: Mode[] = ['headers', 'cookies', 'basic-auth'];

export default function HttpInspector() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('mode');
  const mode: Mode = MODES.includes(requested as Mode) ? (requested as Mode) : 'headers';
  const direction: Direction = searchParams.get('direction') === 'decode' ? 'decode' : 'encode';
  const text = (key: string) => t(`tools.httpInspector.${key}` as MessageKey);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const basicEncoding = mode === 'basic-auth' && direction === 'encode';
  const result = useMemo(() => {
    if (basicEncoding ? !username && !password : !input.trim()) return { output: '', error: '' };
    try {
      const output =
        mode === 'headers'
          ? JSON.stringify(parseHttpHeaders(input), null, 2)
          : mode === 'cookies'
            ? JSON.stringify(parseCookies(input), null, 2)
            : basicEncoding
              ? encodeBasicAuth(username, password)
              : (() => {
                  const decoded = decodeBasicAuth(input);
                  return `${decoded.username}:${decoded.password}`;
                })();
      return { output, error: '' };
    } catch (error) {
      return { output: '', error: error instanceof CuratedWebError ? error.code : 'basicAuth' };
    }
  }, [mode, input, username, password, basicEncoding]);
  const preference = (key: string, value: string) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.set(key, value);
        return params;
      },
      { replace: true }
    );
  };
  const reverse = () => {
    if (direction === 'encode') {
      setInput(result.output);
      preference('direction', 'decode');
    } else {
      const credentials = decodeBasicAuth(input);
      setUsername(credentials.username);
      setPassword(credentials.password);
      setInput(result.output);
      preference('direction', 'encode');
    }
  };
  const changeDirection = (next: Direction) => {
    if (next === direction) return;
    if (result.output && !result.error) reverse();
    else preference('direction', next);
  };
  const reset = () => {
    setInput('');
    setUsername('');
    setPassword('');
  };
  const hint = mode === 'basic-auth' ? 'authHint' : `${mode}Hint`;
  const placeholder = mode === 'basic-auth' ? 'authPlaceholder' : `${mode}Placeholder`;

  return (
    <ToolLayout title={text('name')} description={text('description')} backLabel={t('common.back')}>
      <div className={styles.controls}>
        <Segmented<Mode>
          value={mode}
          onChange={(next) => preference('mode', next)}
          items={MODES.map((value) => ({
            value,
            label: text(value === 'basic-auth' ? 'basicAuth' : value),
          }))}
          size="sm"
          orientation="horizontal"
          ariaLabel={t('common.mode')}
        />
        {mode === 'basic-auth' && (
          <Segmented<Direction>
            value={direction}
            onChange={changeDirection}
            items={[
              { value: 'encode', label: text('encode') },
              { value: 'decode', label: text('decode') },
            ]}
            size="sm"
            orientation="horizontal"
            ariaLabel={text('basicAuth')}
          />
        )}
      </div>
      <ToolGrid>
        <ToolPane
          title={t('common.input')}
          actions={
            <Button size="sm" variant="ghost" onClick={reset}>
              {t('common.clear')}
            </Button>
          }
        >
          <div className={styles.fields}>
            {basicEncoding ? (
              <>
                <TextField
                  label={text('username')}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setInput(`${event.target.value}:${password}`);
                  }}
                  autoComplete="off"
                />
                <div className={styles.passwordField}>
                  <span>{text('password')}</span>
                  <PasswordInput
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setInput(`${username}:${event.target.value}`);
                    }}
                    aria-label={text('password')}
                    autoComplete="off"
                    showLabel={t('common.show')}
                    hideLabel={t('common.hide')}
                  />
                </div>
              </>
            ) : (
              <TextArea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={text(placeholder)}
                aria-label={t('common.input')}
                invalid={Boolean(result.error)}
              />
            )}
            <p className={styles.hint}>{text(hint)}</p>
          </div>
        </ToolPane>
        <ToolPane
          title={
            mode === 'basic-auth' && direction === 'decode'
              ? text('credentials')
              : t('common.output')
          }
          actions={
            <CopyButton
              value={result.output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={!result.output || Boolean(result.error)}
            />
          }
        >
          {result.error ? (
            <Alert variant="danger" role="alert">
              {t(`webError.${result.error}` as MessageKey)}
            </Alert>
          ) : (
            <div className={styles.fields}>
              <TextArea value={result.output} readOnly aria-label={t('common.output')} />
              {mode === 'basic-auth' && (
                <Button size="sm" onClick={reverse} disabled={!result.output}>
                  {text('reverse')}
                </Button>
              )}
            </div>
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
