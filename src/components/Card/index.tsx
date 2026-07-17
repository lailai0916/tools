import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type CardProps = {
  children: ReactNode;
  padding?: CSSProperties['padding'];
  className?: string;
  style?: CSSProperties;
};

export default function Card({ children, padding, className, style }: CardProps) {
  return (
    <div
      className={clsx(styles.card, className)}
      style={padding != null ? { padding, ...style } : style}
    >
      {children}
    </div>
  );
}
