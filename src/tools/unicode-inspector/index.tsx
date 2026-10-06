import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, Table } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import { inspectUnicode } from '@/utils/unicodeInspector';
import styles from './styles.module.css';

export default function UnicodeInspector() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const { rows, truncated, hasUnpairedSurrogate } = useMemo(() => inspectUnicode(input), [input]);

  return (
    <ToolLayout
      title={t('tools.unicodeInspector.name')}
      description={t('tools.unicodeInspector.description')}
      backLabel={t('common.back')}
    >
      <ToolPane
        title={t('common.input')}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {t('common.clear')}
            </Button>
          </>
        }
      >
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('tools.unicodeInspector.placeholder')}
          aria-label={t('common.input')}
        />
      </ToolPane>

      {hasUnpairedSurrogate && (
        <Alert variant="warning" role="status">
          {t('tools.unicodeInspector.unpairedSurrogate')}
        </Alert>
      )}

      {rows.length === 0 ? (
        <p className={styles.empty}>{t('tools.unicodeInspector.empty')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <Table>
            <thead>
              <tr>
                <th className={styles.th}>{t('tools.unicodeInspector.character')}</th>
                <th className={styles.th}>{t('tools.unicodeInspector.codePoint')}</th>
                <th className={styles.th}>{t('tools.unicodeInspector.decimal')}</th>
                <th className={styles.th}>{t('tools.unicodeInspector.utf8')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className={styles.glyphCell}>
                    <span className={styles.glyph}>{row.glyph}</span>
                  </td>
                  <td className={styles.td}>{row.codePoint}</td>
                  <td className={styles.td}>{row.decimal}</td>
                  <td className={styles.td}>
                    {row.utf8 ?? t('tools.unicodeInspector.invalidUtf8')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {truncated && <p className={styles.truncated}>{t('tools.unicodeInspector.truncated')}</p>}
        </div>
      )}
    </ToolLayout>
  );
}
