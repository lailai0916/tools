import { Alert, Button, DropdownSelectField, TextAreaField, TextField } from '@lailai0916/ui';
import { useEffect, useMemo, useState } from 'react';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane, ToolResults } from '@/components/ToolWorkspace';
import type { LocalizedToolGuide } from '@/content/toolGuides/types';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { UtilityInputError } from '@/utils/UtilityInputError';
import styles from './styles.module.css';

export type UtilityValues = Record<string, string>;

export type UtilityField = {
  key: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  defaultValue?: string;
  options?: readonly string[];
  min?: string;
  max?: string;
  step?: string;
};

export type UtilityDefinition = {
  stem: string;
  fields: readonly UtilityField[];
  compute: (values: UtilityValues, text: (suffix: string) => string) => string;
  outputRows?: boolean;
};

function messageKey(value: string): MessageKey {
  return value as MessageKey;
}

function initialValues(fields: readonly UtilityField[]): UtilityValues {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? '']));
}

export function UtilityWorkbench({
  definition,
  guide,
}: {
  definition: UtilityDefinition;
  guide: LocalizedToolGuide;
}) {
  const { t } = useI18n();
  const defaults = useMemo(() => initialValues(definition.fields), [definition.fields]);
  const [values, setValues] = useState<UtilityValues>(defaults);

  useEffect(() => setValues(defaults), [defaults]);

  const result = useMemo(() => {
    if (Object.values(values).every((value) => value === '')) {
      return { output: '', error: '' };
    }
    try {
      const stem = `tools.${definition.stem}`;
      return {
        output: definition.compute(values, (suffix) => t(messageKey(`${stem}.${suffix}`))),
        error: '',
      };
    } catch (error) {
      return {
        output: '',
        error:
          error instanceof UtilityInputError
            ? t(messageKey(`utilityError.${error.code}`))
            : t('common.invalidInput'),
      };
    }
  }, [definition, t, values]);

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => setValues(defaults);
  const stem = `tools.${definition.stem}`;
  const singleEditor = definition.fields.length === 1 && definition.fields[0].type === 'textarea';
  const resultRows =
    definition.outputRows && result.output
      ? result.output
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const separator = line.indexOf(': ');
            return separator < 0
              ? null
              : { label: line.slice(0, separator), value: line.slice(separator + 2) };
          })
      : [];

  return (
    <ToolLayout
      guide={guide}
      title={t(messageKey(`${stem}.name`))}
      description={t(messageKey(`${stem}.description`))}
      backLabel={t('common.back')}
    >
      <ToolGrid>
        <ToolPane
          title={
            singleEditor ? t(messageKey(`${stem}.${definition.fields[0].key}`)) : t('common.input')
          }
          actions={
            <Button size="sm" variant="ghost" onClick={reset}>
              {t('common.reset')}
            </Button>
          }
        >
          <div className={styles.fields}>
            {definition.fields.map((field) => {
              const label = t(messageKey(`${stem}.${field.key}`));
              const placeholderKey = messageKey(`${stem}.${field.key}Placeholder`);
              const placeholder = t(placeholderKey) === placeholderKey ? '' : t(placeholderKey);

              return singleEditor ? (
                <TextArea
                  key={field.key}
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={placeholder}
                  aria-label={label}
                />
              ) : field.type === 'textarea' ? (
                <TextAreaField
                  wrapperClassName={styles.wideField}
                  key={field.key}
                  label={label}
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={placeholder}
                  aria-label={label}
                  monospace
                />
              ) : field.type === 'select' ? (
                <DropdownSelectField
                  key={field.key}
                  label={label}
                  value={values[field.key] ?? ''}
                  onValueChange={(value) => update(field.key, value)}
                  options={(field.options ?? []).map((option) => ({
                    value: option,
                    label: t(messageKey(`${stem}.${field.key}.${option}`)),
                  }))}
                />
              ) : (
                <TextField
                  key={field.key}
                  label={label}
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                />
              );
            })}
          </div>
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
          {result.error ? (
            <Alert variant="danger" role="alert">
              {result.error}
            </Alert>
          ) : resultRows.length > 0 && resultRows.every((row) => row !== null) ? (
            <ToolResults rows={resultRows} />
          ) : definition.outputRows ? (
            <pre className={styles.result}>{result.output || t('common.waitingForInput')}</pre>
          ) : (
            <TextArea
              value={result.output}
              readOnly
              placeholder={t('common.waitingForInput')}
              aria-label={t('common.output')}
              rows={definition.fields.some((field) => field.type === 'textarea') ? undefined : 3}
            />
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}

export function createUtilityTool(definition: UtilityDefinition, guide: LocalizedToolGuide) {
  return function UtilityTool() {
    return <UtilityWorkbench definition={definition} guide={guide} />;
  };
}
