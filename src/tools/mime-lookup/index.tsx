import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

// Common file-extension → MIME-type reference. Extensions are stored without the dot.
const MIME_TABLE: { ext: string; mime: string }[] = [
  { ext: 'txt', mime: 'text/plain' },
  { ext: 'csv', mime: 'text/csv' },
  { ext: 'html', mime: 'text/html' },
  { ext: 'htm', mime: 'text/html' },
  { ext: 'css', mime: 'text/css' },
  { ext: 'md', mime: 'text/markdown' },
  { ext: 'ics', mime: 'text/calendar' },
  { ext: 'js', mime: 'text/javascript' },
  { ext: 'mjs', mime: 'text/javascript' },
  { ext: 'json', mime: 'application/json' },
  { ext: 'jsonld', mime: 'application/ld+json' },
  { ext: 'xml', mime: 'application/xml' },
  { ext: 'yaml', mime: 'application/yaml' },
  { ext: 'yml', mime: 'application/yaml' },
  { ext: 'wasm', mime: 'application/wasm' },
  { ext: 'pdf', mime: 'application/pdf' },
  { ext: 'rtf', mime: 'application/rtf' },
  { ext: 'doc', mime: 'application/msword' },
  {
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  { ext: 'xls', mime: 'application/vnd.ms-excel' },
  {
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  { ext: 'ppt', mime: 'application/vnd.ms-powerpoint' },
  {
    ext: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  { ext: 'odt', mime: 'application/vnd.oasis.opendocument.text' },
  { ext: 'ods', mime: 'application/vnd.oasis.opendocument.spreadsheet' },
  { ext: 'odp', mime: 'application/vnd.oasis.opendocument.presentation' },
  { ext: 'zip', mime: 'application/zip' },
  { ext: 'gz', mime: 'application/gzip' },
  { ext: 'tar', mime: 'application/x-tar' },
  { ext: '7z', mime: 'application/x-7z-compressed' },
  { ext: 'rar', mime: 'application/vnd.rar' },
  { ext: 'bz2', mime: 'application/x-bzip2' },
  { ext: 'bin', mime: 'application/octet-stream' },
  { ext: 'jar', mime: 'application/java-archive' },
  { ext: 'png', mime: 'image/png' },
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'jpeg', mime: 'image/jpeg' },
  { ext: 'gif', mime: 'image/gif' },
  { ext: 'webp', mime: 'image/webp' },
  { ext: 'svg', mime: 'image/svg+xml' },
  { ext: 'ico', mime: 'image/vnd.microsoft.icon' },
  { ext: 'bmp', mime: 'image/bmp' },
  { ext: 'tif', mime: 'image/tiff' },
  { ext: 'tiff', mime: 'image/tiff' },
  { ext: 'avif', mime: 'image/avif' },
  { ext: 'heic', mime: 'image/heic' },
  { ext: 'mp3', mime: 'audio/mpeg' },
  { ext: 'wav', mime: 'audio/wav' },
  { ext: 'ogg', mime: 'audio/ogg' },
  { ext: 'oga', mime: 'audio/ogg' },
  { ext: 'weba', mime: 'audio/webm' },
  { ext: 'aac', mime: 'audio/aac' },
  { ext: 'flac', mime: 'audio/flac' },
  { ext: 'mid', mime: 'audio/midi' },
  { ext: 'mp4', mime: 'video/mp4' },
  { ext: 'webm', mime: 'video/webm' },
  { ext: 'ogv', mime: 'video/ogg' },
  { ext: 'avi', mime: 'video/x-msvideo' },
  { ext: 'mov', mime: 'video/quicktime' },
  { ext: 'mkv', mime: 'video/x-matroska' },
  { ext: 'mpeg', mime: 'video/mpeg' },
  { ext: 'ts', mime: 'video/mp2t' },
  { ext: 'woff', mime: 'font/woff' },
  { ext: 'woff2', mime: 'font/woff2' },
  { ext: 'ttf', mime: 'font/ttf' },
  { ext: 'otf', mime: 'font/otf' },
  { ext: 'eot', mime: 'application/vnd.ms-fontobject' },
];

export default function MimeLookup() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\./, '');
    if (!q) {
      return MIME_TABLE;
    }
    return MIME_TABLE.filter(({ ext, mime }) => ext.includes(q) || mime.toLowerCase().includes(q));
  }, [query]);

  return (
    <ToolLayout
      title={t('tools.mimeLookup.name')}
      description={t('tools.mimeLookup.description')}
      backLabel={t('common.back')}
    >
      <TextArea
        className={styles.input}
        rows={1}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('tools.mimeLookup.placeholder')}
        aria-label={t('tools.mimeLookup.placeholder')}
      />

      <div className={styles.head}>
        <span className={styles.headExt}>{t('tools.mimeLookup.extension')}</span>
        <span className={styles.headMime}>{t('tools.mimeLookup.mimeType')}</span>
      </div>

      {results.length === 0 ? (
        <p className={styles.hint}>{t('tools.mimeLookup.noResults')}</p>
      ) : (
        <div className={styles.results}>
          {results.map(({ ext, mime }) => (
            <div className={styles.row} key={`${ext}-${mime}`}>
              <span className={styles.rowExt}>.{ext}</span>
              <code className={styles.rowMime}>{mime}</code>
              <CopyButton value={mime} label={t('common.copy')} copiedLabel={t('common.copied')} />
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
