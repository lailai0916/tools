import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type Ctx = { blocks: string[]; used: Set<string> };

function isPlainObject(v: Json): v is { [key: string]: Json } {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pascalCase(key: string): string {
  const words = key.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const name = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const safe = name.replace(/^[^A-Za-z]+/, '');
  return safe || 'Item';
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.slice(0, -3) + 'y';
  if (/ses$/i.test(name)) return name.slice(0, -2);
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);
  return name;
}

function uniqueName(ctx: Ctx, base: string): string {
  let name = base;
  let n = 2;
  while (ctx.used.has(name)) {
    name = `${base}${n++}`;
  }
  ctx.used.add(name);
  return name;
}

function propName(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;
}

function emitInterface(name: string, samples: { [key: string]: Json }[], ctx: Ctx): string {
  const finalName = uniqueName(ctx, name);
  const idx = ctx.blocks.length;
  ctx.blocks.push('');

  const order: string[] = [];
  const grouped = new Map<string, Json[]>();
  for (const obj of samples) {
    for (const key of Object.keys(obj)) {
      if (!grouped.has(key)) {
        grouped.set(key, []);
        order.push(key);
      }
      grouped.get(key)!.push(obj[key]);
    }
  }

  const lines = order.map((key) => {
    const values = grouped.get(key)!;
    const optional = values.length < samples.length;
    const type = inferUnion(values, key, ctx);
    return `  ${propName(key)}${optional ? '?' : ''}: ${type};`;
  });

  ctx.blocks[idx] =
    lines.length > 0
      ? `interface ${finalName} {\n${lines.join('\n')}\n}`
      : `interface ${finalName} {}`;
  return finalName;
}

function inferArray(elems: Json[], keyHint: string, ctx: Ctx): string {
  if (elems.length === 0) return 'unknown[]';
  const inner = inferUnion(elems, singularize(keyHint), ctx);
  return inner.includes('|') ? `(${inner})[]` : `${inner}[]`;
}

function inferUnion(values: Json[], keyHint: string, ctx: Ctx): string {
  const types = new Set<string>();
  const objSamples: { [key: string]: Json }[] = [];
  const arrElems: Json[] = [];
  let hasArray = false;

  for (const v of values) {
    if (v === null) types.add('null');
    else if (Array.isArray(v)) {
      hasArray = true;
      for (const e of v) arrElems.push(e);
    } else if (isPlainObject(v)) objSamples.push(v);
    else if (typeof v === 'string') types.add('string');
    else if (typeof v === 'number') types.add('number');
    else if (typeof v === 'boolean') types.add('boolean');
    else types.add('unknown');
  }

  if (objSamples.length > 0) types.add(emitInterface(pascalCase(keyHint), objSamples, ctx));
  if (hasArray) types.add(inferArray(arrElems, keyHint, ctx));

  const list = [...types];
  if (list.length === 0) return 'unknown';
  return list.join(' | ');
}

type Output = { ok: true; code: string } | { ok: false; error: string } | { ok: null };

function generate(input: string, rootName: string): Output {
  const trimmed = input.trim();
  if (!trimmed) return { ok: null };
  let parsed: Json;
  try {
    parsed = JSON.parse(trimmed) as Json;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  const root = pascalCase(rootName.trim() || 'Root');
  const ctx: Ctx = { blocks: [], used: new Set() };
  if (isPlainObject(parsed)) {
    emitInterface(root, [parsed], ctx);
  } else {
    ctx.used.add(root);
    const type = inferUnion([parsed], root, ctx);
    ctx.blocks.unshift(`type ${root} = ${type};`);
  }
  return { ok: true, code: ctx.blocks.join('\n\n') };
}

export default function JsonToTs() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('Root');

  const result = useMemo(() => generate(input, rootName), [input, rootName]);
  const code = result.ok === true ? result.code : '';
  const error = result.ok === false ? result.error : '';

  return (
    <ToolLayout
      title={t('tools.jsonToTs.name')}
      description={t('tools.jsonToTs.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.field}>
        <label className={styles.paneLabel}>{t('tools.jsonToTs.rootName')}</label>
        <TextArea
          className={styles.name}
          rows={1}
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          aria-label={t('tools.jsonToTs.rootName')}
        />
      </div>

      <div className={styles.pane}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          invalid={result.ok === false}
          placeholder={t('tools.jsonToTs.placeholder')}
          aria-label={t('common.input')}
        />
        {result.ok === false && (
          <p className={styles.error}>
            {t('tools.jsonToTs.error')}
            {error ? `: ${error}` : ''}
          </p>
        )}
      </div>

      <div className={styles.pane}>
        <div className={styles.outputHead}>
          <label className={styles.paneLabel}>{t('tools.jsonToTs.output')}</label>
          <CopyButton value={code} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
        <TextArea value={code} readOnly aria-label={t('tools.jsonToTs.output')} />
      </div>
    </ToolLayout>
  );
}
