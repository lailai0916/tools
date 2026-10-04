import { Button, Checkbox, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Options = {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeBlankLines: boolean;
  tabsToSpaces: boolean;
  tabWidth: number;
  removeAll: boolean;
};

function clean(input: string, o: Options): string {
  if (o.removeAll) {
    return input.replace(/\s+/g, '');
  }
  let lines = input.split(/\r\n|\r|\n/);
  if (o.tabsToSpaces) {
    const pad = ' '.repeat(Math.max(0, o.tabWidth));
    lines = lines.map((l) => l.replaceAll('\t', pad));
  }
  if (o.trimLines) {
    lines = lines.map((l) => l.trim());
  }
  if (o.collapseSpaces) {
    lines = lines.map((l) => l.replace(/ {2,}/g, ' '));
  }
  if (o.removeBlankLines) {
    lines = lines.filter((l) => l.trim() !== '');
  }
  return lines.join('\n');
}

export default function RemoveWhitespace() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [tabsToSpaces, setTabsToSpaces] = useState(false);
  const [tabWidth, setTabWidth] = useState(2);
  const [removeAll, setRemoveAll] = useState(false);

  const output = useMemo(
    () =>
      clean(input, {
        trimLines,
        collapseSpaces,
        removeBlankLines,
        tabsToSpaces,
        tabWidth,
        removeAll,
      }),
    [input, trimLines, collapseSpaces, removeBlankLines, tabsToSpaces, tabWidth, removeAll]
  );

  return (
    <ToolLayout
      title={t('tools.removeWhitespace.name')}
      description={t('tools.removeWhitespace.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.pane}>
        <div className={styles.paneHead}>
          <label className={styles.paneLabel}>{t('common.input')}</label>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {t('common.clear')}
          </Button>
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.removeWhitespace.placeholder')}
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.options}>
        <Checkbox
          checked={trimLines}
          disabled={removeAll}
          onChange={(e) => setTrimLines(e.target.checked)}
          label={t('tools.removeWhitespace.trimLines')}
        />
        <Checkbox
          checked={collapseSpaces}
          disabled={removeAll}
          onChange={(e) => setCollapseSpaces(e.target.checked)}
          label={t('tools.removeWhitespace.collapseSpaces')}
        />
        <Checkbox
          checked={removeBlankLines}
          disabled={removeAll}
          onChange={(e) => setRemoveBlankLines(e.target.checked)}
          label={t('tools.removeWhitespace.removeBlankLines')}
        />
        <Checkbox
          checked={tabsToSpaces}
          disabled={removeAll}
          onChange={(e) => setTabsToSpaces(e.target.checked)}
          label={t('tools.removeWhitespace.tabsToSpaces')}
        />
        <TextField
          wrapperClassName={styles.tabWidth}
          label={t('tools.removeWhitespace.tabWidth')}
          type="number"
          className={styles.num}
          min={0}
          max={8}
          value={tabWidth}
          disabled={removeAll || !tabsToSpaces}
          onChange={(e) => {
            const n = Number(e.target.value);
            setTabWidth(Number.isFinite(n) ? Math.min(8, Math.max(0, Math.round(n))) : 0);
          }}
          aria-label={t('tools.removeWhitespace.tabWidth')}
          monospace
        />
        <Checkbox
          checked={removeAll}
          onChange={(e) => setRemoveAll(e.target.checked)}
          label={t('tools.removeWhitespace.removeAll')}
        />
      </div>

      <div className={styles.pane}>
        <div className={styles.paneHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
