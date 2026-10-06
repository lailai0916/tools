import { Alert, Button, Input, Segmented, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane, ToolResults } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  buildUtm,
  CuratedWebError,
  jsonToQuery,
  parseUrl,
  queryToJson,
  resolveUrl,
  updateUrlQuery,
  type UtmValues,
} from '@/utils/curatedWeb';
import styles from './styles.module.css';

type Operation = 'parse' | 'query' | 'resolve' | 'utm';
type Direction = 'toJson' | 'toQuery';
const OPERATIONS: Operation[] = ['parse', 'query', 'resolve', 'utm'];

export default function UrlWorkbench() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('operation');
  const operation: Operation = OPERATIONS.includes(requested as Operation)
    ? (requested as Operation)
    : 'parse';
  const text = (key: string) => t(`tools.urlWorkbench.${key}` as MessageKey);
  const [urlInput, setUrlInput] = useState('https://example.com/docs/?tag=one&tag=two#section');
  const [direction, setDirection] = useState<Direction>('toJson');
  const [queryDraft, setQueryDraft] = useState<string | null>(null);
  const [relative, setRelative] = useState('../images/logo.svg');
  const [utm, setUtm] = useState<UtmValues>({
    source: 'newsletter',
    medium: 'email',
    campaign: 'release',
    term: '',
    content: '',
  });
  const parsed = useMemo(() => {
    try {
      return { url: parseUrl(urlInput), error: '' };
    } catch (error) {
      return { url: null, error: error instanceof CuratedWebError ? error.code : 'url' };
    }
  }, [urlInput]);
  const currentQuery = parsed.url?.search.slice(1) ?? '';
  const queryInput = useMemo(() => {
    if (queryDraft !== null) return queryDraft;
    if (direction === 'toJson') return currentQuery;
    try {
      return queryToJson(currentQuery);
    } catch {
      return '';
    }
  }, [currentQuery, direction, queryDraft]);
  const result = useMemo(() => {
    try {
      const output =
        operation === 'parse'
          ? queryToJson(parseUrl(urlInput).search.slice(1))
          : operation === 'query'
            ? direction === 'toJson'
              ? queryToJson(queryInput)
              : jsonToQuery(queryInput)
            : operation === 'resolve'
              ? resolveUrl(urlInput, relative)
              : buildUtm(urlInput, utm);
      return { output, error: '' };
    } catch (error) {
      return { output: '', error: error instanceof CuratedWebError ? error.code : 'url' };
    }
  }, [operation, urlInput, queryInput, direction, relative, utm]);
  const updateUrl = (value: string) => {
    setUrlInput(value);
    setQueryDraft(null);
  };
  const changeOperation = (next: Operation) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.set('operation', next);
        return params;
      },
      { replace: true }
    );
  };
  const changeDirection = (next: Direction) => {
    if (next === direction) return;
    setQueryDraft(result.error ? queryInput : result.output);
    setDirection(next);
  };
  const applyQuery = () => {
    const query = direction === 'toQuery' ? result.output : queryInput;
    updateUrl(updateUrlQuery(urlInput, query));
  };
  const rows = parsed.url
    ? (
        ['protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash', 'origin'] as const
      ).map((key) => ({ label: text(key), value: parsed.url![key] || '—' }))
    : [];

  return (
    <ToolLayout title={text('name')} description={text('description')} backLabel={t('common.back')}>
      <div className={styles.controls}>
        <Segmented<Operation>
          value={operation}
          onChange={changeOperation}
          items={OPERATIONS.map((value) => ({ value, label: text(value) }))}
          size="sm"
          orientation="horizontal"
          ariaLabel={t('common.mode')}
        />
      </div>
      <ToolPane title={text('url')}>
        <Input
          monospace
          value={urlInput}
          onChange={(event) => updateUrl(event.target.value)}
          aria-label={text('url')}
          spellCheck={false}
          invalid={Boolean(urlInput && parsed.error)}
          placeholder="https://example.com/path?key=value"
        />
        {urlInput && parsed.error && (
          <Alert variant="danger" role="alert">
            {t(`webError.${parsed.error}` as MessageKey)}
          </Alert>
        )}
      </ToolPane>
      <div className={styles.workspace}>
        <ToolGrid>
          <ToolPane title={operation === 'parse' ? text('parse') : t('common.input')}>
            {operation === 'parse' ? (
              <ToolResults rows={rows} />
            ) : operation === 'query' ? (
              <div className={styles.fields}>
                <Segmented<Direction>
                  value={direction}
                  onChange={changeDirection}
                  items={[
                    { value: 'toJson', label: text('toJson') },
                    { value: 'toQuery', label: text('toQuery') },
                  ]}
                  size="sm"
                  orientation="horizontal"
                  ariaLabel={t('common.mode')}
                />
                <TextArea
                  value={queryInput}
                  onChange={(event) => setQueryDraft(event.target.value)}
                  aria-label={t('common.input')}
                  invalid={Boolean(result.error)}
                />
                <Button size="sm" variant="ghost" onClick={() => setQueryDraft(null)}>
                  {text('loadQuery')}
                </Button>
                <p className={styles.hint}>{text('queryHint')}</p>
              </div>
            ) : operation === 'resolve' ? (
              <TextField
                label={text('relative')}
                value={relative}
                onChange={(event) => setRelative(event.target.value)}
                placeholder={text('relativePlaceholder')}
                monospace
              />
            ) : (
              <div className={styles.fieldGrid}>
                {(Object.keys(utm) as (keyof UtmValues)[]).map((key) => (
                  <TextField
                    key={key}
                    label={text(key)}
                    value={utm[key]}
                    onChange={(event) =>
                      setUtm((previous) => ({ ...previous, [key]: event.target.value }))
                    }
                  />
                ))}
              </div>
            )}
          </ToolPane>
          <ToolPane
            title={operation === 'parse' ? text('params') : t('common.output')}
            actions={
              <CopyButton
                value={result.output}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
                disabled={Boolean(result.error)}
              />
            }
          >
            {result.error ? (
              <Alert variant="danger" role="alert">
                {t(`webError.${result.error}` as MessageKey)}
              </Alert>
            ) : (
              <div className={styles.fields}>
                <TextArea value={result.output} readOnly aria-label={t('common.output')} />
                {operation === 'query' ? (
                  <Button size="sm" onClick={applyQuery} disabled={!parsed.url}>
                    {text('applyQuery')}
                  </Button>
                ) : operation !== 'parse' ? (
                  <Button size="sm" onClick={() => updateUrl(result.output)}>
                    {text('useUrl')}
                  </Button>
                ) : null}
              </div>
            )}
          </ToolPane>
        </ToolGrid>
      </div>
    </ToolLayout>
  );
}
