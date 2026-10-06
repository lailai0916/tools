import { Icon, IconButton } from '@lailai0916/ui';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function FavoriteButton({
  active,
  onClick,
  className = '',
  name,
  variant = 'default',
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  name?: string;
  variant?: 'default' | 'document';
}) {
  const { t } = useI18n();
  return (
    <IconButton
      size={variant === 'document' ? 'sm' : 'md'}
      className={`${styles.button} ${variant === 'document' ? styles.document : ''} ${className}`}
      aria-pressed={active}
      label={[t(active ? 'site.removeFavorite' : 'site.addFavorite'), name]
        .filter(Boolean)
        .join(': ')}
      onClick={onClick}
    >
      <Icon
        icon="lucide:star"
        width={variant === 'document' ? 16 : undefined}
        height={variant === 'document' ? 16 : undefined}
      />
    </IconButton>
  );
}
