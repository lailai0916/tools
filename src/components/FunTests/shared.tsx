import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { Icon } from '@iconify/react';
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

export function useLabText() {
  const { t } = useI18n();
  return (suffix: string) => t(messageKey(`fun.${suffix}`));
}

export function TestShell({ stem, children }: { stem: GameStem; children: ReactNode }) {
  const { t } = useI18n();
  useEffect(() => {
    const diagnostics = window as typeof window & {
      render_game_to_text?: () => string;
      advanceTime?: (milliseconds: number) => void;
    };
    diagnostics.render_game_to_text = () =>
      JSON.stringify({
        tool: stem,
        route: window.location.pathname,
        visibleState: document.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim(),
      });
    diagnostics.advanceTime = (milliseconds) => {
      window.dispatchEvent(new CustomEvent('fun-test-advance', { detail: milliseconds }));
    };
    return () => {
      delete diagnostics.render_game_to_text;
      delete diagnostics.advanceTime;
    };
  }, [stem]);
  return (
    <ToolLayout
      title={t(messageKey(`tools.${stem}.name`))}
      description={t(messageKey(`tools.${stem}.description`))}
      backLabel={t('common.back')}
      wide
    >
      <div className={styles.labFrame}>{children}</div>
    </ToolLayout>
  );
}

export function useLocalBest(
  key: string,
  value: number,
  active: boolean,
  direction: 'higher' | 'lower' = 'higher'
) {
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(`fun.best.${key}`)) || 0);
    } catch {
      setBest(0);
    }
    setNewBest(false);
  }, [key]);

  useEffect(() => {
    if (!active || !Number.isFinite(value) || value <= 0) return;
    const improved = best === 0 || (direction === 'higher' ? value > best : value < best);
    if (!improved) return;
    setBest(value);
    setNewBest(true);
    try {
      localStorage.setItem(`fun.best.${key}`, String(value));
    } catch {
      // Local records are optional.
    }
  }, [active, best, direction, key, value]);

  return { best, newBest };
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

export function SessionBar({
  status,
  progress,
  detail,
  active = false,
  complete = false,
  continuous = false,
}: {
  status: string;
  progress: number;
  detail?: ReactNode;
  active?: boolean;
  complete?: boolean;
  continuous?: boolean;
}) {
  return (
    <div className={styles.sessionBar} aria-live="polite">
      <div className={styles.sessionState}>
        <span
          className={clsx(
            styles.statusDot,
            active && styles.statusDotActive,
            complete && styles.statusDotComplete
          )}
          aria-hidden="true"
        />
        <strong>{status}</strong>
      </div>
      <div
        className={clsx(styles.sessionProgress, continuous && styles.sessionProgressContinuous)}
        aria-hidden="true"
      >
        <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }} />
      </div>
      {detail != null && <div className={styles.sessionDetail}>{detail}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={clsx(styles.metricCard, accent && styles.metricCardAccent)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail != null && <small>{detail}</small>}
    </div>
  );
}

export function TelemetryGrid({ children }: { children: ReactNode }) {
  return <div className={styles.telemetryGrid}>{children}</div>;
}

export function LineChart({
  values,
  label,
  durationSeconds,
  samplingLabel,
  activeIndex,
}: {
  values: number[];
  label: string;
  durationSeconds: number;
  samplingLabel: string;
  activeIndex?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number>();
  const chartContainer = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(720);
  const chartHeight = chartWidth < 480 ? 160 : 180;
  const padding = { top: 12, right: 12, bottom: 28, left: 36 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const rawMax = Math.max(0, ...values);
  const max = Math.max(1, rawMax);
  const yMax = Math.max(2, Math.ceil(max / 2) * 2);
  const point = (value: number, index: number) => ({
    x: padding.left + (values.length === 1 ? 0 : (index / (values.length - 1)) * innerWidth),
    y: padding.top + innerHeight - (value / yMax) * innerHeight,
  });
  const points = values.map((value, index) => point(value, index));
  const visiblePoints =
    activeIndex == null ? points : points.slice(0, Math.max(2, activeIndex + 1));
  const path = visiblePoints
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');
  const displayIndex = hoverIndex ?? activeIndex;
  const activePoint = displayIndex == null ? undefined : points[displayIndex];
  const activeValue = displayIndex == null ? undefined : values[displayIndex];
  const activeTime =
    displayIndex == null || values.length <= 1
      ? undefined
      : (displayIndex / (values.length - 1)) * durationSeconds;
  const midpoint = durationSeconds / 2;

  useEffect(() => {
    const element = chartContainer.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const updateWidth = (width: number) => setChartWidth(Math.max(240, Math.round(width)));
    updateWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => updateWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const inspect = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const next = Math.round(ratio * (values.length - 1));
    setHoverIndex(activeIndex == null ? next : Math.min(activeIndex, next));
  };

  return (
    <figure className={styles.lineChartPanel}>
      <figcaption className={styles.lineChartHeader}>
        <span>{label}</span>
        <span>{samplingLabel}</span>
      </figcaption>
      <div ref={chartContainer} className={styles.lineChartViewport}>
        <svg
          className={styles.lineChart}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ height: chartHeight }}
          role="img"
          aria-label={`${label}: ${durationSeconds} seconds, ${values.length} samples, peak ${rawMax.toFixed(1)} CPS`}
          onPointerMove={inspect}
          onPointerLeave={() => setHoverIndex(undefined)}
        >
          <title>{label}</title>
          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + innerHeight * ratio;
            const value = Math.round(yMax * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  className={styles.lineChartGrid}
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                />
                <text className={styles.lineChartAxis} x={padding.left - 8} y={y + 4}>
                  {value}
                </text>
              </g>
            );
          })}
          <path className={styles.lineChartPath} d={path} />
          {activePoint && activeValue != null && activeTime != null && (
            <g className={styles.lineChartInspector} aria-hidden="true">
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={padding.top}
                y2={padding.top + innerHeight}
              />
              <circle cx={activePoint.x} cy={activePoint.y} r="4" />
              <text
                x={Math.min(chartWidth - 86, Math.max(86, activePoint.x))}
                y={Math.max(24, activePoint.y - 12)}
              >
                {activeTime.toFixed(durationSeconds <= 10 ? 2 : 1)}s · {activeValue.toFixed(1)} CPS
              </text>
            </g>
          )}
          <text className={styles.lineChartAxisStart} x={padding.left} y={chartHeight - 6}>
            0s
          </text>
          {durationSeconds > 1 && (
            <text
              className={styles.lineChartAxisMiddle}
              x={padding.left + innerWidth / 2}
              y={chartHeight - 6}
            >
              {Number.isInteger(midpoint) ? midpoint : midpoint.toFixed(1)}s
            </text>
          )}
          <text
            className={styles.lineChartAxisEnd}
            x={chartWidth - padding.right}
            y={chartHeight - 6}
          >
            {durationSeconds}s
          </text>
        </svg>
      </div>
    </figure>
  );
}

export function GradeBadge({ grade, label }: { grade: string; label: string }) {
  return (
    <div className={styles.gradeBadge}>
      <span>{label}</span>
      <strong>{grade}</strong>
    </div>
  );
}

export function ReportShell({
  eyebrow,
  score,
  unit,
  grade,
  gradeLabel,
  newBest,
  newBestLabel,
  children,
  insight,
  replayLabel,
  replayHint,
  onReplay,
}: {
  eyebrow: string;
  score: string;
  unit: string;
  grade: string;
  gradeLabel: string;
  newBest?: boolean;
  newBestLabel?: string;
  children: ReactNode;
  insight: string;
  replayLabel: string;
  replayHint: string;
  onReplay: () => void;
}) {
  useEffect(() => {
    const replay = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'r' || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      onReplay();
    };
    window.addEventListener('keydown', replay);
    return () => window.removeEventListener('keydown', replay);
  }, [onReplay]);

  return (
    <section className={styles.reportShell}>
      <header className={styles.reportHero}>
        <div>
          <span className={styles.reportEyebrow}>{eyebrow}</span>
          <div className={styles.reportScore}>
            <strong>{score}</strong>
            <span>{unit}</span>
          </div>
          {newBest && <span className={styles.bestPill}>{newBestLabel}</span>}
        </div>
        <GradeBadge grade={grade} label={gradeLabel} />
      </header>
      {children}
      <div className={styles.insightCard}>
        <Icon icon="lucide:scan-line" aria-hidden="true" />
        <p>{insight}</p>
      </div>
      <footer className={styles.reportActions}>
        <Button
          variant="primary"
          size="md"
          onClick={onReplay}
          leftIcon={<Icon icon="lucide:rotate-ccw" />}
        >
          {replayLabel}
        </Button>
        <span>
          {replayHint} <kbd>R</kbd>
        </span>
      </footer>
    </section>
  );
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
