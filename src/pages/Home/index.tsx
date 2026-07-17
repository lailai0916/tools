import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { useI18n } from '@/i18n';
import { TOOLS } from '@/tools/registry';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

export default function Home() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) {
      return TOOLS;
    }
    return TOOLS.filter((tool) => {
      const name = t(`tools.${tool.key}.name` as MessageKey).toLowerCase();
      const desc = t(`tools.${tool.key}.description` as MessageKey).toLowerCase();
      return name.includes(q) || desc.includes(q) || tool.id.includes(q);
    });
  }, [q, t]);

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{t('site.title')}</h1>
        <p className={styles.tagline}>{t('site.tagline')}</p>
      </div>

      <div className={styles.searchWrap}>
        <Icon icon="lucide:search" className={styles.searchIcon} />
        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('site.searchPlaceholder')}
          aria-label={t('site.searchPlaceholder')}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>{t('site.noResults')}</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((tool) => (
            <Link key={tool.id} to={`/${tool.id}`} className={styles.card}>
              <span className={styles.cardIcon}>
                <Icon icon={tool.icon} />
              </span>
              <span className={styles.cardName}>{t(`tools.${tool.key}.name` as MessageKey)}</span>
              <span className={styles.cardDesc}>
                {t(`tools.${tool.key}.description` as MessageKey)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
