import { Icon, Panel, PanelBody } from '@lailai0916/ui';
import { useId } from 'react';
import { toolGuides } from '@/content/toolGuides';
import type { ToolGuideKey } from '@/content/toolGuides/types';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

export default function ToolGuide({ toolKey }: { toolKey: string }) {
  const { locale, t } = useI18n();
  const headingId = useId();
  const guide = toolGuides[toolKey as ToolGuideKey][locale];

  return (
    <section className={styles.guide} data-tool="guide" aria-labelledby={headingId}>
      <h2 className={styles.title} id={headingId}>
        <Icon icon="lucide:book-open" width={20} />
        {t('guide.title')}
      </h2>
      <p className={styles.summary}>{guide.summary}</p>
      <div className={styles.grid}>
        <div className={styles.instructions}>
          <div>
            <h3 className={styles.subtitle}>{t('guide.steps')}</h3>
            <ol className={styles.list}>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className={styles.subtitle}>{t('guide.notes')}</h3>
            <ul className={styles.list}>
              {guide.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.example}>
          <h3 className={styles.subtitle}>{t('guide.example')}</h3>
          <Panel tone="muted">
            <PanelBody className={styles.exampleBody}>
              <dl className={styles.exampleList}>
                <div>
                  <dt>{t('guide.input')}</dt>
                  <dd>
                    <pre>
                      <code>{guide.example.input}</code>
                    </pre>
                  </dd>
                </div>
                <div>
                  <dt>{t('guide.output')}</dt>
                  <dd>
                    <pre>
                      <code>{guide.example.output}</code>
                    </pre>
                  </dd>
                </div>
              </dl>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </section>
  );
}
