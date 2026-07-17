import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Result = { ok: true; uri: string; css: string } | { ok: false } | { ok: null };

function looksLikeSvg(input: string): boolean {
  return /<svg[\s>]/i.test(input) && /<\/svg>/i.test(input);
}

function encode(svg: string): string {
  const body = svg.trim().replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/"/g, "'");
  const payload = encodeURIComponent(body).replace(/%[0-9A-F]{2}/g, (m) => {
    switch (m) {
      case '%20':
        return ' ';
      case '%3D':
        return '=';
      case '%3A':
        return ':';
      case '%2F':
        return '/';
      default:
        return m.toLowerCase();
    }
  });
  return `data:image/svg+xml,${payload}`;
}

function process(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: null };
  if (!looksLikeSvg(trimmed)) return { ok: false };
  const uri = encode(trimmed);
  return { ok: true, uri, css: `background-image: url("${uri}");` };
}

export default function SvgToDataUri() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const result = useMemo(() => process(input), [input]);
  const uri = result.ok === true ? result.uri : '';
  const css = result.ok === true ? result.css : '';

  return (
    <ToolLayout
      title={t('tools.svgDataUri.name')}
      description={t('tools.svgDataUri.description')}
      backLabel={t('common.back')}
    >
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
        placeholder={t('tools.svgDataUri.placeholder')}
        aria-label={t('common.input')}
      />
      {result.ok === false && <p className={styles.error}>{t('tools.svgDataUri.invalid')}</p>}
      {result.ok === null && <p className={styles.hint}>{t('tools.svgDataUri.empty')}</p>}

      {result.ok === true && (
        <>
          <div className={styles.pane}>
            <div className={styles.outputHead}>
              <label className={styles.paneLabel}>{t('tools.svgDataUri.output')}</label>
              <CopyButton value={uri} label={t('common.copy')} copiedLabel={t('common.copied')} />
            </div>
            <TextArea
              className={styles.short}
              value={uri}
              readOnly
              aria-label={t('tools.svgDataUri.output')}
            />
          </div>

          <div className={styles.pane}>
            <div className={styles.outputHead}>
              <label className={styles.paneLabel}>{t('tools.svgDataUri.cssValue')}</label>
              <CopyButton value={css} label={t('common.copy')} copiedLabel={t('common.copied')} />
            </div>
            <TextArea
              className={styles.short}
              value={css}
              readOnly
              aria-label={t('tools.svgDataUri.cssValue')}
            />
          </div>
        </>
      )}
    </ToolLayout>
  );
}
