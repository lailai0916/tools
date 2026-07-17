import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type Model = { title: string; description: string; url: string; image: string; siteName: string };

function build(m: Model): string {
  const lines: string[] = [];
  const title = m.title.trim();
  const description = m.description.trim();
  const url = m.url.trim();
  const image = m.image.trim();
  const siteName = m.siteName.trim();

  if (title) lines.push(`<title>${escapeAttr(title)}</title>`);
  if (description) lines.push(`<meta name="description" content="${escapeAttr(description)}">`);
  if (url) lines.push(`<link rel="canonical" href="${escapeAttr(url)}">`);

  const hasOg = title || description || url || image || siteName;
  if (hasOg) lines.push('<meta property="og:type" content="website">');
  if (title) lines.push(`<meta property="og:title" content="${escapeAttr(title)}">`);
  if (description)
    lines.push(`<meta property="og:description" content="${escapeAttr(description)}">`);
  if (url) lines.push(`<meta property="og:url" content="${escapeAttr(url)}">`);
  if (image) lines.push(`<meta property="og:image" content="${escapeAttr(image)}">`);
  if (siteName) lines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}">`);

  const hasTwitter = title || description || image;
  if (hasTwitter) {
    lines.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`);
  }
  if (title) lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}">`);
  if (description)
    lines.push(`<meta name="twitter:description" content="${escapeAttr(description)}">`);
  if (image) lines.push(`<meta name="twitter:image" content="${escapeAttr(image)}">`);

  return lines.join('\n');
}

export default function MetaTags() {
  const { t } = useI18n();
  const [model, setModel] = useState<Model>({
    title: '',
    description: '',
    url: '',
    image: '',
    siteName: '',
  });

  const output = useMemo(() => build(model), [model]);

  const fields: { key: keyof Model; label: string; placeholder: string }[] = [
    { key: 'title', label: t('tools.metaTags.titleField'), placeholder: 'My Page Title' },
    {
      key: 'description',
      label: t('tools.metaTags.descriptionField'),
      placeholder: 'A short summary of the page.',
    },
    { key: 'url', label: t('tools.metaTags.url'), placeholder: 'https://example.com/page' },
    {
      key: 'image',
      label: t('tools.metaTags.image'),
      placeholder: 'https://example.com/cover.png',
    },
    { key: 'siteName', label: t('tools.metaTags.siteName'), placeholder: 'Example' },
  ];

  return (
    <ToolLayout
      title={t('tools.metaTags.name')}
      description={t('tools.metaTags.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.grid}>
        {fields.map((f) => (
          <div className={styles.field} key={f.key}>
            <label className={styles.label}>{f.label}</label>
            <TextArea
              className={styles.input}
              rows={1}
              monospace={false}
              value={model[f.key]}
              onChange={(e) => setModel((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              aria-label={f.label}
            />
          </div>
        ))}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.metaTags.output')}</label>
          <CopyButton value={output} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea
          className={styles.output}
          value={output}
          readOnly
          aria-label={t('tools.metaTags.output')}
        />
      </div>
    </ToolLayout>
  );
}
