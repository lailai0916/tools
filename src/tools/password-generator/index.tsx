import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, Checkbox, Slider, Input } from '@lailai0916/ui';
import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/|`~';
const AMBIGUOUS = new Set('O0oIl1|`'.split(''));

const CLASSES = ['uppercase', 'lowercase', 'digits', 'symbols'] as const;
type CharClass = (typeof CLASSES)[number];

type Options = Record<CharClass, boolean> & {
  length: number;
  excludeAmbiguous: boolean;
};

const DEFAULT: Options = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: false,
  excludeAmbiguous: false,
};

const SOURCES: Record<CharClass, string> = {
  uppercase: UPPER,
  lowercase: LOWER,
  digits: DIGITS,
  symbols: SYMBOLS,
};

// Unbiased index in [0, n) via rejection sampling — n is tiny here.
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

function buildPool(opts: Options): string {
  let pool = CLASSES.filter((c) => opts[c])
    .map((c) => SOURCES[c])
    .join('');
  if (opts.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join('');
  }
  return pool;
}

function sourceFor(c: CharClass, opts: Options): string {
  return opts.excludeAmbiguous
    ? [...SOURCES[c]].filter((char) => !AMBIGUOUS.has(char)).join('')
    : SOURCES[c];
}

function draw(opts: Options): string {
  const pool = buildPool(opts);
  if (!pool) return '';

  // Include every enabled character class, then shuffle so required characters
  // do not appear in predictable positions.
  const chars = CLASSES.filter((c) => opts[c]).map((c) => {
    const source = sourceFor(c, opts);
    return source[randomBelow(source.length)];
  });
  while (chars.length < opts.length) {
    chars.push(pool[randomBelow(pool.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export default function PasswordGenerator() {
  const { t } = useI18n();
  const [opts, setOpts] = useState<Options>(DEFAULT);
  const [output, setOutput] = useState<string>(() => draw(DEFAULT));

  const noCharset = buildPool(opts).length === 0;

  const commit = (next: Options) => {
    setOpts(next);
    setOutput(draw(next));
  };
  const update = (patch: Partial<Options>) => commit({ ...opts, ...patch });
  const toggleClass = (c: CharClass, checked: boolean) => commit({ ...opts, [c]: checked });

  return (
    <ToolLayout
      title={t('tools.passwordGenerator.name')}
      description={t('tools.passwordGenerator.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.options}>
        <Slider
          label={t('tools.passwordGenerator.length')}
          valueLabel={opts.length}
          value={opts.length}
          min={4}
          max={64}
          onChange={(length) => update({ length })}
        />

        <div className={styles.checks}>
          {CLASSES.map((c) => (
            <Checkbox
              key={c}
              checked={opts[c]}
              onChange={(e) => toggleClass(c, e.target.checked)}
              label={t(`tools.passwordGenerator.${c}` as MessageKey)}
            />
          ))}
          <Checkbox
            checked={opts.excludeAmbiguous}
            onChange={(e) => update({ excludeAmbiguous: e.target.checked })}
            label={t('tools.passwordGenerator.excludeAmbiguous')}
          />
        </div>
      </div>

      <ToolPane
        title={t('tools.passwordGenerator.output')}
        actions={
          <div className={styles.actions}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setOutput(draw(opts))}
              disabled={noCharset}
            >
              {t('tools.passwordGenerator.regenerate')}
            </Button>
            <CopyButton
              value={output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={noCharset}
            />
          </div>
        }
      >
        {noCharset ? (
          <Alert variant="danger">{t('tools.passwordGenerator.noCharset')}</Alert>
        ) : (
          <Input
            monospace
            spellCheck={false}
            value={output}
            readOnly
            aria-label={t('tools.passwordGenerator.output')}
          />
        )}
      </ToolPane>
    </ToolLayout>
  );
}
