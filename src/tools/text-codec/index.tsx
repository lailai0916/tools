import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Button, Segmented, DropdownSelectField } from '@lailai0916/ui';
import ToolLayout from '@/components/ToolLayout';
import { curatedTextGuides } from '@/content/toolGuides/curatedText';
import { ToolGrid, ToolPane } from '@/components/ToolWorkspace';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  CODEC_FORMATS,
  convertTextCodec,
  isCodecFormat,
  TextCodecError,
  type CodecFormat,
  type CodecMode,
  type TextCodecErrorCode,
} from '@/utils/textCodec';
import styles from './styles.module.css';

type Result =
  { ok: null } | { ok: true; output: string } | { ok: false; error: TextCodecErrorCode };

export default function TextCodec() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const parameter = searchParams.get('format');
  const format: CodecFormat = isCodecFormat(parameter) ? parameter : 'base64';
  const [input, setInput] = useState('');
  const mode: CodecMode = searchParams.get('mode') === 'decode' ? 'decode' : 'encode';

  const result = useMemo<Result>(() => {
    if (!input) return { ok: null };
    try {
      return { ok: true, output: convertTextCodec(input, format, mode) };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof TextCodecError ? error.code : 'invalidEncoding',
      };
    }
  }, [input, format, mode]);
  const output = result.ok === true ? result.output : '';

  function changeFormat(nextFormat: CodecFormat) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('format', nextFormat);
        return next;
      },
      { replace: true }
    );
  }

  function changeMode(nextMode: CodecMode) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('mode', nextMode);
        return next;
      },
      { replace: true }
    );
  }

  function swap() {
    if (result.ok !== true) return;
    setInput(result.output);
    changeMode(mode === 'encode' ? 'decode' : 'encode');
  }

  return (
    <ToolLayout
      guide={curatedTextGuides.textCodec}
      title={t('tools.textCodec.name')}
      description={t('tools.textCodec.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <DropdownSelectField
          id="text-codec-format"
          wrapperClassName={styles.format}
          label={t('tools.textCodec.format')}
          value={format}
          onValueChange={(value) => {
            if (isCodecFormat(value)) changeFormat(value);
          }}
          aria-describedby="text-codec-format-hint"
          options={CODEC_FORMATS.map((value) => ({
            value,
            label: t(`tools.textCodec.formats.${value}` as MessageKey),
          }))}
        />
        <Segmented<CodecMode>
          value={mode}
          onChange={changeMode}
          items={[
            { value: 'encode', label: t('tools.textCodec.encode') },
            { value: 'decode', label: t('tools.textCodec.decode') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.mode')}
        />
        <Button size="sm" variant="secondary" onClick={swap} disabled={result.ok !== true}>
          {t('tools.textCodec.swap')}
        </Button>
      </div>
      <p id="text-codec-format-hint" className={styles.hint}>
        {t(`tools.textCodec.formatHint.${format}` as MessageKey)}
      </p>

      <ToolGrid>
        <ToolPane
          title={<label htmlFor="text-codec-input">{t('common.input')}</label>}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            id="text-codec-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            invalid={result.ok === false}
            aria-describedby={result.ok === false ? 'text-codec-error' : undefined}
            placeholder={t(
              mode === 'encode'
                ? 'tools.textCodec.encodePlaceholder'
                : 'tools.textCodec.decodePlaceholder'
            )}
          />
          {result.ok === false && (
            <Alert id="text-codec-error" variant="danger" role="alert">
              {t(`tools.textCodec.errors.${result.error}` as MessageKey)}
            </Alert>
          )}
        </ToolPane>
        <ToolPane
          title={<label htmlFor="text-codec-output">{t('common.output')}</label>}
          actions={
            <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
          }
        >
          <TextArea
            id="text-codec-output"
            value={output}
            readOnly
            placeholder={t('tools.textCodec.empty')}
          />
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
