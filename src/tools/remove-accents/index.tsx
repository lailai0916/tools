import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

function strip(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .normalize('NFC');
}

export default function RemoveAccents() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const output = useMemo(() => strip(input), [input]);
  const empty = input === '';

  return (
    <ToolLayout
      title={t('tools.removeAccents.name')}
      description={t('tools.removeAccents.description')}
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
        placeholder={t('tools.removeAccents.placeholder')}
        aria-label={t('common.input')}
      />

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.removeAccents.output')}</label>
          <CopyButton
            value={output}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
            disabled={empty}
          />
        </div>
        {empty ? (
          <p className={styles.empty}>{t('tools.removeAccents.empty')}</p>
        ) : (
          <TextArea value={output} readOnly aria-label={t('tools.removeAccents.output')} />
        )}
      </div>
    </ToolLayout>
  );
}
