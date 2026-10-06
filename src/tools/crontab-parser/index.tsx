import { Alert, Card, Input } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { developmentGuides } from '@/content/toolGuides/development';
import { useI18n } from '@/i18n';
import { CRON_KINDS, parseCronExpression } from '@/utils/cronExpression';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

export default function CrontabParser() {
  const { t, locale } = useI18n();
  const [expr, setExpr] = useState('*/5 9-17 * * 1-5');

  const parsed = useMemo(() => parseCronExpression(expr, locale), [expr, locale]);

  return (
    <ToolLayout
      guide={developmentGuides.crontabParser}
      title={t('tools.crontabParser.name')}
      description={t('tools.crontabParser.description')}
      backLabel={t('common.back')}
    >
      <Input
        monospace
        spellCheck={false}
        className={styles.expr}
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        invalid={parsed.ok === false}
        placeholder={t('tools.crontabParser.placeholder')}
        aria-label={t('tools.crontabParser.name')}
      />

      {parsed.ok === false && <Alert variant="danger">{t('tools.crontabParser.invalid')}</Alert>}

      {parsed.ok === true && (
        <>
          <Card className={styles.summary}>
            <span className={styles.summaryLabel}>{t('tools.crontabParser.summary')}</span>
            <p className={styles.summaryText}>{parsed.summary}</p>
          </Card>

          <div className={styles.results}>
            {CRON_KINDS.map((kind) => (
              <div className={styles.row} key={kind}>
                <span className={styles.rowLabel}>
                  {t(`tools.crontabParser.${kind}` as MessageKey)}
                </span>
                <code className={styles.rowField}>{parsed.fields[kind]}</code>
                <span className={styles.rowValue}>{parsed.descriptions[kind]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
