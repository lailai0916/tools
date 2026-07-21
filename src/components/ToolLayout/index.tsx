import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import styles from './styles.module.css';

type ToolLayoutProps = {
  title: string;
  description?: string;
  backLabel: string;
  children: ReactNode;
  wide?: boolean;
};

export default function ToolLayout({
  title,
  description,
  backLabel,
  children,
  wide = false,
}: ToolLayoutProps) {
  return (
    <div className={clsx(styles.layout, wide && styles.wide)}>
      <Link to="/" className={styles.back}>
        <Icon icon="lucide:arrow-left" />
        <span>{backLabel}</span>
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
