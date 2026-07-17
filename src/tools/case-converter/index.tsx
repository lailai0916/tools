import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

function tokenize(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function convert(input: string): { labelKey: MessageKey; value: string }[] {
  const words = tokenize(input).map((w) => w.toLowerCase());
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  return [
    {
      labelKey: 'tools.caseConverter.camel',
      value: words.map((w, i) => (i === 0 ? w : cap(w))).join(''),
    },
    { labelKey: 'tools.caseConverter.pascal', value: words.map(cap).join('') },
    { labelKey: 'tools.caseConverter.snake', value: words.join('_') },
    { labelKey: 'tools.caseConverter.kebab', value: words.join('-') },
    { labelKey: 'tools.caseConverter.constant', value: words.join('_').toUpperCase() },
    { labelKey: 'tools.caseConverter.upper', value: words.join(' ').toUpperCase() },
    { labelKey: 'tools.caseConverter.lower', value: words.join(' ') },
    { labelKey: 'tools.caseConverter.title', value: words.map(cap).join(' ') },
  ];
}

export default function CaseConverter() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const results = useMemo(() => convert(input), [input]);
  const empty = input.trim() === '';

  return (
    <ToolLayout
      title={t('tools.caseConverter.name')}
      description={t('tools.caseConverter.description')}
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
        placeholder={t('tools.caseConverter.placeholder')}
        aria-label={t('common.input')}
      />

      <div className={styles.results}>
        {results.map(({ labelKey, value }) => (
          <div className={styles.row} key={labelKey}>
            <span className={styles.rowLabel}>{t(labelKey)}</span>
            <code className={styles.rowValue} data-empty={empty}>
              {empty ? t('tools.caseConverter.emptyHint') : value}
            </code>
            <CopyButton
              value={value}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={empty}
            />
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
