import { ButtonLink, Icon, PageContainer, Stack } from '@lailai0916/ui';
import type { ReactNode } from 'react';
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
    <PageContainer width={wide ? 980 : 820}>
      <ButtonLink
        to="/"
        size="sm"
        variant="ghost"
        className={styles.back}
        leftIcon={<Icon icon="lucide:arrow-left" />}
      >
        {backLabel}
      </ButtonLink>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <Stack gap={18}>{children}</Stack>
    </PageContainer>
  );
}
