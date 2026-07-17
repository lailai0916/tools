import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
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
        <div className={styles.modes}>
          <Button size="sm" active={direction === 'asc'} onClick={() => setDirection('asc')}>
            {t('tools.sortLines.asc')}
          </Button>
          <Button size="sm" active={direction === 'desc'} onClick={() => setDirection('desc')}>
            {t('tools.sortLines.desc')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(e) => setCaseInsensitive(e.target.checked)}
          />
          {t('tools.sortLines.caseInsensitive')}
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={numeric} onChange={(e) => setNumeric(e.target.checked)} />
          {t('tools.sortLines.numeric')}
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} />
          {t('tools.sortLines.dedupe')}
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={removeEmpty}
            onChange={(e) => setRemoveEmpty(e.target.checked)}
          />
          {t('tools.sortLines.removeEmpty')}
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
          />
          {t('tools.sortLines.trimLines')}
        </label>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.sortLines.placeholder')}
          aria-label={t('common.input')}
        />
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
