import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import Button from '@/components/Button';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

export type GameStem =
  | 'cpsTest'
  | 'spacebarTest'
  | 'reactionTime'
  | 'aimTrainer'
  | 'mouseAccuracy'
  | 'scrollSpeed'
  | 'schulteTable'
  | 'timePerception'
  | 'stroopTest'
  | 'colorHueTest'
  | 'oddOneOut'
  | 'rhythmTest'
  | 'sequenceMemory'
  | 'numberMemory'
  | 'visualMemory'
  | 'verbalMemory'
  | 'memoryMatch'
  | 'arithmeticSprint'
  | 'goNoGo'
  | 'typingSpeed';

export function messageKey(key: string): MessageKey {
  return key as MessageKey;
}

export function useGameText(stem: GameStem) {
  const { t } = useI18n();
  return (suffix: string) => t(messageKey(`tools.${stem}.${suffix}`));
}

export function TestShell({ stem, children }: { stem: GameStem; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <ToolLayout
      title={t(messageKey(`tools.${stem}.name`))}
      description={t(messageKey(`tools.${stem}.description`))}
      backLabel={t('common.back')}
    >
      {children}
    </ToolLayout>
  );
}

export function GamePanel({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={clsx(styles.panel, className)} style={style}>
      {children}
    </section>
  );
}

export function Instructions({ children }: { children: ReactNode }) {
  return <p className={styles.instructions}>{children}</p>;
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
  format = String,
  disabled = false,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
  format?: (value: T) => string;
  disabled?: boolean;
}) {
  return (
    <div className={styles.segmentedWrap}>
      <span className={styles.eyebrow}>{label}</span>
      <div className={styles.segmented} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={clsx(styles.segment, value === option && styles.segmentActive)}
            aria-pressed={value === option}
            disabled={disabled}
            onClick={() => onChange(option)}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Stats({ children }: { children: ReactNode }) {
  return <dl className={styles.stats}>{children}</dl>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function Result({
  title,
  value,
  detail,
  onReset,
  resetLabel,
}: {
  title: string;
  value: ReactNode;
  detail?: ReactNode;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <GamePanel className={styles.resultPanel}>
      <span className={styles.eyebrow}>{title}</span>
      <strong className={styles.resultValue}>{value}</strong>
      {detail && <p className={styles.resultDetail}>{detail}</p>}
      <Button variant="primary" onClick={onReset}>
        {resetLabel}
      </Button>
    </GamePanel>
  );
}

export function PrimaryAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="primary" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export function shuffle<T>(values: readonly T[]): T[] {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2)} s`;
}

export { styles as funStyles };
