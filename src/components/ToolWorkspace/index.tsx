import { useId, type ReactNode } from 'react';
import styles from './styles.module.css';

export function ToolGrid({ children }: { children: ReactNode }) {
  return (
    <div className={styles.grid} data-tool="split">
      {children}
    </div>
  );
}

export function ToolPane({
  title,
  actions,
  children,
  className = '',
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section className={`${styles.pane} ${className}`} data-tool="pane" aria-labelledby={id}>
      <div className={styles.paneHeader}>
        <h2 id={id} className={styles.label}>
          {title}
        </h2>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export type ToolResultRow = { label: string; value: ReactNode; action?: ReactNode };

export function ToolResults({ rows }: { rows: ToolResultRow[] }) {
  return (
    <dl className={styles.resultList} data-tool="results">
      {rows.map((row, index) => (
        <div key={index} className={styles.resultRow}>
          <dt className={styles.resultLabel}>{row.label}</dt>
          <dd className={styles.resultValue}>{row.value}</dd>
          {row.action}
        </div>
      ))}
    </dl>
  );
}
