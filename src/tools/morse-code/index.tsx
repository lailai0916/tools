import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Mode = 'toMorse' | 'toText';

const MORSE: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  '@': '.--.-.',
};

const FROM_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]): [string, string] => [v, k])
);

function encode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map((word) =>
      Array.from(word)
        .map((ch) => MORSE[ch] ?? '')
        .filter(Boolean)
        .join(' ')
    )
    .filter(Boolean)
    .join(' / ');
}

function decode(input: string): string {
  return input
    .trim()
    .split(/\s*\/\s*/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => FROM_MORSE[code] ?? '')
        .join('')
    )
    .filter(Boolean)
    .join(' ');
}

function process(input: string, mode: Mode): string {
  if (!input.trim()) {
    return '';
  }
  return mode === 'toMorse' ? encode(input) : decode(input);
}

export default function MorseCode() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('toMorse');

  const output = useMemo(() => process(input, mode), [input, mode]);

  return (
    <ToolLayout
      title={t('tools.morseCode.name')}
      description={t('tools.morseCode.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={mode === 'toMorse'} onClick={() => setMode('toMorse')}>
            {t('tools.morseCode.toMorse')}
          </Button>
          <Button size="sm" active={mode === 'toText'} onClick={() => setMode('toText')}>
            {t('tools.morseCode.toText')}
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
          placeholder={
            mode === 'toMorse'
              ? t('tools.morseCode.textPlaceholder')
              : t('tools.morseCode.morsePlaceholder')
          }
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
