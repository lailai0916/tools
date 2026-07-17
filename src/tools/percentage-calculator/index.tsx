import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

const DASH = '—';

function num(v: string): number | null {
  const s = v.trim();
  if (s === '') {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? '0' : String(r);
}

export default function PercentageCalculator() {
  const { t } = useI18n();
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [c1, setC1] = useState('');
  const [c2, setC2] = useState('');

  const rA = useMemo(() => {
    const x = num(a1);
    const y = num(a2);
    return x === null || y === null ? DASH : fmt((x / 100) * y);
  }, [a1, a2]);

  const rB = useMemo(() => {
    const x = num(b1);
    const y = num(b2);
    return x === null || y === null || y === 0 ? DASH : `${fmt((x / y) * 100)}%`;
  }, [b1, b2]);

  const rC = useMemo(() => {
    const x = num(c1);
    const y = num(c2);
    return x === null || y === null || x === 0 ? DASH : `${fmt(((y - x) / x) * 100)}%`;
  }, [c1, c2]);

  const blocks: {
    id: string;
    titleKey: MessageKey;
    xKey: MessageKey;
    yKey: MessageKey;
    x: string;
    setX: (v: string) => void;
    y: string;
    setY: (v: string) => void;
    res: string;
  }[] = [
    {
      id: 'a',
      titleKey: 'tools.percentageCalculator.percentOf',
      xKey: 'tools.percentageCalculator.percentOfX',
      yKey: 'tools.percentageCalculator.percentOfY',
      x: a1,
      setX: setA1,
      y: a2,
      setY: setA2,
      res: rA,
    },
    {
      id: 'b',
      titleKey: 'tools.percentageCalculator.isWhatPercent',
      xKey: 'tools.percentageCalculator.isWhatX',
      yKey: 'tools.percentageCalculator.isWhatY',
      x: b1,
      setX: setB1,
      y: b2,
      setY: setB2,
      res: rB,
    },
    {
      id: 'c',
      titleKey: 'tools.percentageCalculator.percentChange',
      xKey: 'tools.percentageCalculator.changeFrom',
      yKey: 'tools.percentageCalculator.changeTo',
      x: c1,
      setX: setC1,
      y: c2,
      setY: setC2,
      res: rC,
    },
  ];

  return (
    <ToolLayout
      title={t('tools.percentageCalculator.name')}
      description={t('tools.percentageCalculator.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.blocks}>
        {blocks.map((b) => (
          <div key={b.id} className={styles.block}>
            <h2 className={styles.blockTitle}>{t(b.titleKey)}</h2>
            <div className={styles.inputs}>
              <label className={styles.field}>
                <span className={styles.label}>{t(b.xKey)}</span>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  value={b.x}
                  onChange={(e) => b.setX(e.target.value)}
                  aria-label={t(b.xKey)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t(b.yKey)}</span>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  value={b.y}
                  onChange={(e) => b.setY(e.target.value)}
                  aria-label={t(b.yKey)}
                />
              </label>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>{t('tools.percentageCalculator.result')}</span>
              <code className={styles.rowValue} data-empty={b.res === DASH}>
                {b.res}
              </code>
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
