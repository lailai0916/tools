import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

const MAX_ROWS = 500;

type CodePointRow = {
  glyph: string;
  codePoint: string;
  decimal: string;
  utf8: string;
};

function inspect(input: string): { rows: CodePointRow[]; truncated: boolean } {
  const chars = Array.from(input);
  const truncated = chars.length > MAX_ROWS;
  const encoder = new TextEncoder();
  const rows = chars.slice(0, MAX_ROWS).map((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    const utf8 = Array.from(encoder.encode(ch))
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
    return {
      glyph: ch,
      codePoint: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      decimal: String(cp),
      utf8,
    };
  });
  return { rows, truncated };
}

export default function UnicodeInspector() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const { rows, truncated } = useMemo(() => inspect(input), [input]);

  return (
    <ToolLayout
      title={t('tools.unicodeInspector.name')}
      description={t('tools.unicodeInspector.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('tools.unicodeInspector.placeholder')}
        aria-label={t('common.input')}
      />

      {rows.length === 0 ? (
        <p className={styles.empty}>{t('tools.unicodeInspector.empty')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
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
                  <td className={styles.td}>{row.utf8}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {truncated && <p className={styles.truncated}>{t('tools.unicodeInspector.truncated')}</p>}
        </div>
      )}
    </ToolLayout>
  );
}
