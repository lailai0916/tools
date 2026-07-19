import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { splitGraphemes } from '@/utils/text';
import styles from './styles.module.css';

type Stats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  bytes: number;
  readingTime: number;
};

function computeStats(input: string): Stats {
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  return {
    characters: splitGraphemes(input).length,
    charactersNoSpaces: splitGraphemes(input.replace(/\s/g, '')).length,
    words,
    lines: input.length === 0 ? 0 : input.split(/\r\n|\r|\n/).length,
    sentences: (input.match(/[^.!?。！？…]+[.!?。！？…]+/g) || []).length,
    paragraphs: input
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean).length,
    bytes: new TextEncoder().encode(input).length,
    readingTime: Math.ceil(words / 200),
  };
}

export default function TextStats() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const stats = useMemo(() => computeStats(input), [input]);

  const rows: { labelKey: MessageKey; value: string }[] = [
    { labelKey: 'tools.textStats.characters', value: String(stats.characters) },
    { labelKey: 'tools.textStats.charactersNoSpaces', value: String(stats.charactersNoSpaces) },
    { labelKey: 'tools.textStats.words', value: String(stats.words) },
    { labelKey: 'tools.textStats.lines', value: String(stats.lines) },
    { labelKey: 'tools.textStats.sentences', value: String(stats.sentences) },
    { labelKey: 'tools.textStats.paragraphs', value: String(stats.paragraphs) },
    { labelKey: 'tools.textStats.bytes', value: String(stats.bytes) },
    {
      labelKey: 'tools.textStats.readingTime',
      value: `${stats.readingTime} ${t('tools.textStats.minutes')}`,
    },
  ];

  return (
    <ToolLayout
      title={t('tools.textStats.name')}
      description={t('tools.textStats.description')}
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
        placeholder={t('tools.textStats.placeholder')}
        aria-label={t('common.input')}
      />

      <div className={styles.results}>
        {rows.map(({ labelKey, value }) => (
          <div className={styles.row} key={labelKey}>
            <span className={styles.rowLabel}>{t(labelKey)}</span>
            <code className={styles.rowValue}>{value}</code>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
