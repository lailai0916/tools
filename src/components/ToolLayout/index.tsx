import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import styles from './styles.module.css';

type ToolLayoutProps = {
  title: string;
  description?: string;
  backLabel: string;
  children: ReactNode;
};

export default function ToolLayout({ title, description, backLabel, children }: ToolLayoutProps) {
  return (
    <div className={styles.layout}>
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
