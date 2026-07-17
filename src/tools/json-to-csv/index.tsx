import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Direction = 'toCsv' | 'toJson';

type Result = { ok: true; output: string } | { ok: false; notArray?: boolean } | { ok: null };

function cell(v: unknown): string {
  if (v === null || v === undefined) {
    return '';
  }
  if (typeof v === 'object') {
    return JSON.stringify(v);
  }
  return String(v);
}

function escapeCsv(s: string): string {
  return /[",\n\r]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
}

function jsonToCsv(input: string): Result {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { ok: false };
  }
  if (!Array.isArray(data)) {
    return { ok: false, notArray: true };
  }
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of data) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          headers.push(k);
        }
      }
    }
  }
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of data) {
    const obj: Record<string, unknown> =
      row && typeof row === 'object' && !Array.isArray(row) ? (row as Record<string, unknown>) : {};
    lines.push(headers.map((h) => escapeCsv(cell(obj[h]))).join(','));
  }
  return { ok: true, output: lines.join('\n') };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function csvToJson(input: string): Result {
  const rows = parseCsv(input);
  if (rows.length === 0) {
    return { ok: null };
  }
  const headers = rows[0];
  const out = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? '';
    });
    return obj;
  });
  return { ok: true, output: JSON.stringify(out, null, 2) };
}

function process(input: string, direction: Direction): Result {
  if (!input.trim()) {
    return { ok: null };
  }
  switch (direction) {
    case 'toCsv':
      return jsonToCsv(input);
    case 'toJson':
      return csvToJson(input);
  }
}

export default function JsonToCsv() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('toCsv');

  const result = useMemo(() => process(input, direction), [input, direction]);

  const output = result.ok === true ? result.output : '';

  return (
    <ToolLayout
      title={t('tools.jsonToCsv.name')}
      description={t('tools.jsonToCsv.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <div className={styles.modes}>
          <Button size="sm" active={direction === 'toCsv'} onClick={() => setDirection('toCsv')}>
            {t('tools.jsonToCsv.toCsv')}
          </Button>
          <Button size="sm" active={direction === 'toJson'} onClick={() => setDirection('toJson')}>
            {t('tools.jsonToCsv.toJson')}
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={
            direction === 'toCsv'
              ? t('tools.jsonToCsv.jsonPlaceholder')
              : t('tools.jsonToCsv.csvPlaceholder')
          }
          aria-label={t('common.input')}
        />
        {result.ok === false && (
          <p className={styles.error}>
            {result.notArray ? t('tools.jsonToCsv.notArray') : t('tools.jsonToCsv.error')}
          </p>
        )}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('common.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={output} readOnly aria-label={t('common.output')} />
      </div>
    </ToolLayout>
  );
}
