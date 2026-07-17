import { Link } from 'react-router';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className={styles.wrap}>
      <h1 className={styles.code}>404</h1>
      <Link to="/" className={styles.link}>
        {t('common.back')}
      </Link>
    </div>
  );
}
