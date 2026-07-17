import { useMemo, useState } from 'react';
import { dump, load } from 'js-yaml';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Direction = 'toYaml' | 'toJson';

type Result = { ok: true; output: string } | { ok: false } | { ok: null };

function process(input: string, direction: Direction): Result {
  if (!input.trim()) {
    return { ok: null };
  }
  try {
    if (direction === 'toYaml') {
      return { ok: true, output: dump(JSON.parse(input)) };
    }
    return { ok: true, output: JSON.stringify(load(input), null, 2) };
  } catch {
    return { ok: false };
  }
}

export default function JsonToYaml() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('toYaml');

  const result = useMemo(() => process(input, direction), [input, direction]);

  const output = result.ok === true ? result.output : '';

  return (
    <ToolLayout
      title={t('tools.jsonToYaml.name')}
      description={t('tools.jsonToYaml.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={direction === 'toYaml'} onClick={() => setDirection('toYaml')}>
            {t('tools.jsonToYaml.toYaml')}
          </Button>
          <Button size="sm" active={direction === 'toJson'} onClick={() => setDirection('toJson')}>
            {t('tools.jsonToYaml.toJson')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={
            direction === 'toYaml'
              ? t('tools.jsonToYaml.jsonPlaceholder')
              : t('tools.jsonToYaml.yamlPlaceholder')
          }
          aria-label={t('common.input')}
        />
        {result.ok === false && <p className={styles.error}>{t('tools.jsonToYaml.error')}</p>}
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
