import { Icon, IconButton } from '@lailai0916/ui';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function FavoriteButton({
  active,
  onClick,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <IconButton
      size="md"
      className={`${styles.button} ${className}`}
      aria-pressed={active}
      label={t(active ? 'site.removeFavorite' : 'site.addFavorite')}
      onClick={onClick}
    >
      <Icon icon="lucide:star" />
    </IconButton>
  );
}
