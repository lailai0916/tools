import { ToolPane, ToolGrid } from '@/components/ToolWorkspace';
import { Button, Checkbox, TextAreaField, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Direction = 'asc' | 'desc';

type Options = {
  direction: Direction;
  caseInsensitive: boolean;
  numeric: boolean;
  dedupe: boolean;
  removeEmpty: boolean;
  trimLines: boolean;
};

function transform(input: string, opts: Options): string {
  if (!input) {
    return '';
  }
  let lines = input.split(/\r\n|\r|\n/);

  if (opts.trimLines) {
    lines = lines.map((l) => l.trim());
  }
  if (opts.removeEmpty) {
    lines = lines.filter((l) => l.trim() !== '');
  }
  if (opts.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = opts.caseInsensitive ? l.toLowerCase() : l;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  const sensitivity = opts.caseInsensitive ? 'base' : 'variant';
  const sorted = [...lines].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: opts.numeric, sensitivity })
  );
  if (opts.direction === 'desc') {
    sorted.reverse();
  }

  return sorted.join('\n');
}

export default function SortLines() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('asc');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [numeric, setNumeric] = useState(false);
  const [dedupe, setDedupe] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [trimLines, setTrimLines] = useState(false);

  const output = useMemo(
    () =>
      transform(input, {
        direction,
        caseInsensitive,
        numeric,
        dedupe,
        removeEmpty,
        trimLines,
      }),
    [input, direction, caseInsensitive, numeric, dedupe, removeEmpty, trimLines]
  );

  return (
    <ToolLayout
      title={t('tools.sortLines.name')}
      description={t('tools.sortLines.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <Segmented<typeof direction>
          value={direction}
          onChange={setDirection}
          items={[
            { value: 'asc', label: t('tools.sortLines.asc') },
            { value: 'desc', label: t('tools.sortLines.desc') },
          ]}
          orientation="horizontal"
          size="sm"
          stackAt={0}
          ariaLabel={t('common.mode')}
        />
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.checks}>
        <Checkbox
          checked={caseInsensitive}
          onChange={(e) => setCaseInsensitive(e.target.checked)}
          label={t('tools.sortLines.caseInsensitive')}
        />
        <Checkbox
          checked={numeric}
          onChange={(e) => setNumeric(e.target.checked)}
          label={t('tools.sortLines.numeric')}
        />
        <Checkbox
          checked={dedupe}
          onChange={(e) => setDedupe(e.target.checked)}
          label={t('tools.sortLines.dedupe')}
        />
        <Checkbox
          checked={removeEmpty}
          onChange={(e) => setRemoveEmpty(e.target.checked)}
          label={t('tools.sortLines.removeEmpty')}
        />
        <Checkbox
          checked={trimLines}
          onChange={(e) => setTrimLines(e.target.checked)}
          label={t('tools.sortLines.trimLines')}
        />
      </div>

      <ToolGrid>
        <TextAreaField
          wrapperClassName={styles.pane}
          label={t('common.input')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.sortLines.placeholder')}
          aria-label={t('common.input')}
        />

        <ToolPane
          title={t('common.output')}
          actions={
            <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
          }
        >
          <TextArea value={output} readOnly aria-label={t('common.output')} />
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
