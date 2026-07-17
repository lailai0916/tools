import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'explicabo',
  'aspernatur',
  'odit',
  'fugit',
  'consequuntur',
  'magni',
  'ratione',
  'sequi',
  'nesciunt',
  'neque',
  'porro',
  'quisquam',
  'dolorem',
  'adipisci',
  'numquam',
  'modi',
];

// Unbiased index in [0, n) via rejection sampling.
function randomBelow(n: number): number {
  const limit = 0x100000000 - (0x100000000 % n);
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % n;
}

function sentence(): string {
  const len = 6 + randomBelow(9); // 6..14 words
  let words = '';
  for (let i = 0; i < len; i++) {
    words += (i ? ' ' : '') + WORDS[randomBelow(WORDS.length)];
  }
  return words.charAt(0).toUpperCase() + words.slice(1) + '.';
}

function paragraph(): string {
  const count = 3 + randomBelow(4); // 3..6 sentences
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(sentence());
  }
  return sentences.join(' ');
}

function generate(paragraphs: number): string {
  const out: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    out.push(paragraph());
  }
  return out.join('\n\n');
}

const COUNTS = [1, 3, 5] as const;

export default function LoremIpsum() {
  const { t } = useI18n();
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState<string>(() => generate(3));

  const regenerate = (n: number) => {
    setCount(n);
    setOutput(generate(n));
  };

  return (
    <ToolLayout
      title={t('tools.loremIpsum.name')}
      description={t('tools.loremIpsum.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.group}>
          <span className={styles.label}>{t('tools.loremIpsum.paragraphs')}</span>
          {COUNTS.map((n) => (
            <Button key={n} size="sm" active={count === n} onClick={() => regenerate(n)}>
              {n}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="primary" onClick={() => regenerate(count)}>
          {t('tools.loremIpsum.regenerate')}
        </Button>
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.loremIpsum.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly rows={10} aria-label={t('tools.loremIpsum.output')} />
      </div>
    </ToolLayout>
  );
}
