import { Alert, Button, Checkbox, DropdownSelectField, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { curatedTextGuides } from '@/content/toolGuides/curatedText';
import { ToolGrid, ToolPane } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  CASE_FORMATS,
  DEFAULT_TEXT_OPTIONS,
  LIST_FORMATS,
  TEXT_OPERATIONS,
  TextWorkbenchError,
  isTextOperation,
  transformText,
  type TextWorkbenchOptions,
} from '@/utils/textWorkbench';
import styles from './styles.module.css';

export default function TextWorkbench() {
  const { t } = useI18n();
  const text = (suffix: string) => t(`tools.textWorkbench.${suffix}` as MessageKey);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('operation');
  const operation = isTextOperation(requested) ? requested : 'case';
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<TextWorkbenchOptions>(DEFAULT_TEXT_OPTIONS);
  const update = <Key extends keyof TextWorkbenchOptions>(
    key: Key,
    value: TextWorkbenchOptions[Key]
  ) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const result = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      return {
        output: transformText(input, operation, options, (label) =>
          t(`tools.textWorkbench.stats.${label}` as MessageKey)
        ),
        error: '',
      };
    } catch (error) {
      return {
        output: '',
        error:
          error instanceof TextWorkbenchError
            ? t(`tools.textWorkbench.errors.${error.code}` as MessageKey)
            : t('common.invalidInput'),
      };
    }
  }, [input, operation, options, t]);

  const select = (
    label: string,
    value: string,
    items: readonly string[],
    prefix: string,
    onChange: (value: string) => void
  ) => (
    <DropdownSelectField
      label={text(label)}
      value={value}
      onValueChange={onChange}
      options={items.map((item) => ({ value: item, label: text(`${prefix}.${item}`) }))}
    />
  );
  const check = (
    key:
      | 'ignoreCase'
      | 'numeric'
      | 'trimLines'
      | 'removeEmpty'
      | 'dedupe'
      | 'collapseSpaces'
      | 'tabsToSpaces'
      | 'removeAll'
      | 'lowercase'
      | 'stripAccents'
  ) => (
    <Checkbox
      key={key}
      label={text(`options.${key}`)}
      checked={options[key]}
      onChange={(event) => update(key, event.target.checked)}
    />
  );
  const lineOptions = operation === 'sort' || operation === 'dedupe' || operation === 'list';

  return (
    <ToolLayout
      guide={curatedTextGuides.textWorkbench}
      title={text('name')}
      description={text('description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <DropdownSelectField
          label={text('operation')}
          value={operation}
          onValueChange={(value) => {
            const next = new URLSearchParams(searchParams);
            next.set('operation', value);
            setSearchParams(next, { replace: true });
          }}
          options={TEXT_OPERATIONS.map((item) => ({
            value: item,
            label: text(`operation.${item}`),
          }))}
        />
        {operation === 'case' &&
          select('caseFormat', options.caseFormat, CASE_FORMATS, 'case', (value) =>
            update('caseFormat', value as TextWorkbenchOptions['caseFormat'])
          )}
        {operation === 'replace' && (
          <>
            <TextField
              label={text('find')}
              value={options.find}
              onChange={(event) => update('find', event.target.value)}
            />
            <TextField
              label={text('replacement')}
              value={options.replacement}
              onChange={(event) => update('replacement', event.target.value)}
            />
          </>
        )}
        {operation === 'slug' &&
          select('separator', options.separator, ['-', '_'], 'separator', (value) =>
            update('separator', value as '-' | '_')
          )}
        {operation === 'sort' &&
          select('direction', options.direction, ['asc', 'desc'], 'direction', (value) =>
            update('direction', value as 'asc' | 'desc')
          )}
        {operation === 'line-endings' &&
          select('lineEnding', options.lineEnding, ['lf', 'crlf', 'cr'], 'lineEnding', (value) =>
            update('lineEnding', value as TextWorkbenchOptions['lineEnding'])
          )}
        {operation === 'reverse' &&
          select(
            'reverseMode',
            options.reverseMode,
            ['graphemes', 'words', 'lines'],
            'reverseMode',
            (value) => update('reverseMode', value as TextWorkbenchOptions['reverseMode'])
          )}
        {operation === 'line-number' && (
          <>
            <TextField
              label={text('start')}
              type="number"
              step="1"
              min={-1_000_000}
              max={1_000_000}
              value={Number.isNaN(options.start) ? '' : options.start}
              onChange={(event) =>
                update('start', event.target.value === '' ? Number.NaN : Number(event.target.value))
              }
            />
            <TextField
              label={text('numberSeparator')}
              value={options.numberSeparator}
              onChange={(event) => update('numberSeparator', event.target.value)}
            />
          </>
        )}
        {operation === 'wrap' && (
          <TextField
            label={text('width')}
            type="number"
            min="1"
            max="100000"
            step="1"
            value={Number.isNaN(options.width) ? '' : options.width}
            onChange={(event) =>
              update('width', event.target.value === '' ? Number.NaN : Number(event.target.value))
            }
          />
        )}
        {operation === 'list' && (
          <>
            {select('listFrom', options.listFrom, LIST_FORMATS, 'listFormat', (value) =>
              update('listFrom', value as TextWorkbenchOptions['listFrom'])
            )}
            {select('listTo', options.listTo, LIST_FORMATS, 'listFormat', (value) =>
              update('listTo', value as TextWorkbenchOptions['listTo'])
            )}
          </>
        )}
        {operation === 'normalize' && (
          <DropdownSelectField
            label={text('normalizeForm')}
            value={options.normalizeForm}
            onValueChange={(value) =>
              update('normalizeForm', value as TextWorkbenchOptions['normalizeForm'])
            }
            options={(['NFC', 'NFD', 'NFKC', 'NFKD'] as const).map((form) => ({
              value: form,
              label: form,
            }))}
          />
        )}
        {operation === 'frequency' && (
          <TextField
            label={text('minimumLength')}
            type="number"
            min="1"
            max="100000"
            step="1"
            value={Number.isNaN(options.minimumLength) ? '' : options.minimumLength}
            onChange={(event) =>
              update(
                'minimumLength',
                event.target.value === '' ? Number.NaN : Number(event.target.value)
              )
            }
          />
        )}
        {operation === 'whitespace' && options.tabsToSpaces && !options.removeAll && (
          <TextField
            label={text('tabWidth')}
            type="number"
            min="1"
            max="32"
            step="1"
            value={Number.isNaN(options.tabWidth) ? '' : options.tabWidth}
            onChange={(event) =>
              update(
                'tabWidth',
                event.target.value === '' ? Number.NaN : Number(event.target.value)
              )
            }
          />
        )}
      </div>

      {(lineOptions ||
        operation === 'slug' ||
        operation === 'whitespace' ||
        operation === 'replace') && (
        <div className={styles.options}>
          {operation === 'replace' && check('ignoreCase')}
          {lineOptions && (
            <>
              {check('trimLines')}
              {check('removeEmpty')}
              {check('ignoreCase')}
              {operation !== 'dedupe' && check('dedupe')}
              {operation === 'sort' && check('numeric')}
            </>
          )}
          {operation === 'slug' && (
            <>
              {check('lowercase')}
              {check('stripAccents')}
            </>
          )}
          {operation === 'whitespace' && (
            <>
              {check('removeAll')}
              {!options.removeAll && (
                <>
                  {check('trimLines')}
                  {check('collapseSpaces')}
                  {check('removeEmpty')}
                  {check('tabsToSpaces')}
                </>
              )}
            </>
          )}
        </div>
      )}
      <p className={styles.hint}>{text(`hint.${operation}`)}</p>

      <ToolGrid>
        <ToolPane
          title={t('common.input')}
          actions={
            <Button size="sm" variant="ghost" disabled={!input} onClick={() => setInput('')}>
              {t('common.clear')}
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={text('placeholder')}
            aria-label={t('common.input')}
            invalid={Boolean(result.error)}
          />
          {result.error && (
            <Alert variant="danger" role="alert">
              {result.error}
            </Alert>
          )}
        </ToolPane>
        <ToolPane
          title={t('common.output')}
          actions={
            <CopyButton
              value={result.output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={!result.output || Boolean(result.error)}
            />
          }
        >
          <TextArea
            value={result.output}
            readOnly
            placeholder={text('empty')}
            aria-label={t('common.output')}
          />
        </ToolPane>
      </ToolGrid>
      <div className={styles.actions}>
        <Button
          disabled={!result.output || Boolean(result.error)}
          onClick={() => setInput(result.output)}
        >
          {text('continue')}
        </Button>
      </div>
    </ToolLayout>
  );
}
