import { ToolPane } from '@/components/ToolWorkspace';
import { Button, Checkbox, TextAreaField, Segmented } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';

import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Separator = '-' | '_';

function slugify(input: string, sep: Separator, lower: boolean, strip: boolean): string {
  let s = input;
  if (strip) {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  if (lower) {
    s = s.toLowerCase();
  }
  s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  while (s.startsWith(sep)) {
    s = s.slice(sep.length);
  }
  while (s.endsWith(sep)) {
    s = s.slice(0, -sep.length);
  }
  return s;
}

export default function Slugify() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState<Separator>('-');
  const [lowercase, setLowercase] = useState(true);
  const [stripDiacritics, setStripDiacritics] = useState(true);

  const slug = useMemo(
    () => slugify(input, separator, lowercase, stripDiacritics),
    [input, separator, lowercase, stripDiacritics]
  );

  return (
    <ToolLayout
      title={t('tools.slugify.name')}
      description={t('tools.slugify.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.optionGroup}>
          <span className={styles.groupLabel}>{t('tools.slugify.separator')}</span>
          <Segmented<typeof separator>
            value={separator}
            onChange={setSeparator}
            items={[
              { value: '-', label: ['-'].join(' ') },
              { value: '_', label: ['_'].join(' ') },
            ]}
            orientation="horizontal"
            size="sm"
            stackAt={0}
            ariaLabel={t('common.mode')}
          />
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.checks}>
        <Checkbox
          checked={lowercase}
          onChange={(e) => setLowercase(e.target.checked)}
          label={t('tools.slugify.lowercase')}
        />
        <Checkbox
          checked={stripDiacritics}
          onChange={(e) => setStripDiacritics(e.target.checked)}
          label={t('tools.slugify.stripDiacritics')}
        />
      </div>

      <TextAreaField
        wrapperClassName={styles.pane}
        label={t('common.input')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('tools.slugify.placeholder')}
        aria-label={t('common.input')}
      />

      <ToolPane
        title={t('tools.slugify.output')}
        actions={
          <CopyButton value={slug} label={t('common.copy')} copiedLabel={t('common.copied')} />
        }
      >
        <code className={styles.output} data-empty={!slug}>
          {slug || t('tools.slugify.empty')}
        </code>
      </ToolPane>
    </ToolLayout>
  );
}
