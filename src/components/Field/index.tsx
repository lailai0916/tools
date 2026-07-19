import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  action?: ReactNode;
  error?: string;
  hint?: string;
  className?: string;
};

export default function Field({
  label,
  htmlFor,
  children,
  action,
  error,
  hint,
  className,
}: FieldProps) {
  return (
    <div className={clsx(styles.field, className)}>
      <div className={styles.header}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
        {action != null && <div className={styles.action}>{action}</div>}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
