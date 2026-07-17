import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const NATO: Record<string, string> = {
  A: 'Alfa',
  B: 'Bravo',
  C: 'Charlie',
  D: 'Delta',
  E: 'Echo',
  F: 'Foxtrot',
  G: 'Golf',
  H: 'Hotel',
  I: 'India',
  J: 'Juliett',
  K: 'Kilo',
  L: 'Lima',
  M: 'Mike',
  N: 'November',
  O: 'Oscar',
  P: 'Papa',
  Q: 'Quebec',
  R: 'Romeo',
  S: 'Sierra',
  T: 'Tango',
  U: 'Uniform',
  V: 'Victor',
  W: 'Whiskey',
  X: 'X-ray',
  Y: 'Yankee',
  Z: 'Zulu',
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Niner',
};

function spell(input: string): string {
  const parts: string[] = [];
  for (const ch of input) {
    // Whitespace becomes a plain word gap via the join; other symbols pass through.
    if (/\s/.test(ch)) {
      continue;
    }
    parts.push(NATO[ch.toUpperCase()] ?? ch);
  }
  return parts.join(' ');
}

export default function NatoAlphabet() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const output = useMemo(() => spell(input), [input]);
  const empty = input.trim() === '';

  return (
    <ToolLayout
      title={t('tools.natoAlphabet.name')}
      description={t('tools.natoAlphabet.description')}
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
        placeholder={t('tools.natoAlphabet.placeholder')}
        aria-label={t('common.input')}
      />

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.natoAlphabet.output')}</label>
          <CopyButton
            value={output}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
            disabled={empty}
          />
        </div>
        {empty ? (
          <p className={styles.empty}>{t('tools.natoAlphabet.empty')}</p>
        ) : (
          <TextArea value={output} readOnly aria-label={t('tools.natoAlphabet.output')} />
        )}
      </div>
    </ToolLayout>
  );
}
