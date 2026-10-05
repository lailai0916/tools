import { ButtonLink, Icon, Panel, PanelBody, Stack } from '@lailai0916/ui';
import type { ReactNode } from 'react';
import FavoriteButton from '@/components/FavoriteButton';
import ToolGuide from '@/components/ToolGuide';
import { useToolNavigation } from '@/hooks/useToolNavigation';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { toggleToolFavorite } from '@/utils/toolStorage';
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
  const { tool } = useToolNavigation();
  const { favorites } = useSavedTools();
  const { t } = useI18n();
  const content = <Stack gap={24}>{children}</Stack>;
  return (
    <div className={styles.layout} data-tool="page" data-wide={wide || undefined}>
      <nav className={styles.breadcrumb} aria-label={t('site.breadcrumb')}>
        <ButtonLink
          to="/"
          size="sm"
          variant="ghost"
          leftIcon={<Icon icon="lucide:arrow-left" width={14} />}
        >
          {backLabel}
        </ButtonLink>
        {tool && (
          <>
            <Icon icon="lucide:chevron-right" width={14} />
            <ButtonLink to={`/?category=${tool.category}`} size="sm" variant="ghost">
              {t(`category.${tool.category}` as MessageKey)}
            </ButtonLink>
          </>
        )}
      </nav>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {tool && (
          <FavoriteButton
            name={title}
            active={favorites.includes(tool.id)}
            onClick={() => toggleToolFavorite(tool.id)}
          />
        )}
      </header>
      {tool?.category === 'fun' ? (
        content
      ) : (
        <Panel className={styles.workspace}>
          <PanelBody className={styles.body}>{content}</PanelBody>
        </Panel>
      )}
      {tool && <ToolGuide toolKey={tool.key} />}
    </div>
  );
}
