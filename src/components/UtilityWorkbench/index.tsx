import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/Button';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
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

export function UtilityWorkbench({ definition }: { definition: UtilityDefinition }) {
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

  return (
    <ToolLayout
      title={t(messageKey(`${stem}.name`))}
      description={t(messageKey(`${stem}.description`))}
      backLabel={t('common.back')}
    >
      <div className={styles.fields}>
        {definition.fields.map((field) => {
          const label = t(messageKey(`${stem}.${field.key}`));
          const placeholderKey = messageKey(`${stem}.${field.key}Placeholder`);
          const placeholder = t(placeholderKey) === placeholderKey ? '' : t(placeholderKey);

          return (
            <label
              className={field.type === 'textarea' ? styles.wideField : styles.field}
              key={field.key}
            >
              <span className={styles.label}>{label}</span>
              {field.type === 'textarea' ? (
                <TextArea
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={placeholder}
                  aria-label={label}
                />
              ) : field.type === 'select' ? (
                <select
                  className={styles.control}
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  aria-label={label}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {t(messageKey(`${stem}.${field.key}.${option}`))}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.control}
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  aria-label={label}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className={styles.outputHeader}>
        <span className={styles.label}>{t('common.output')}</span>
        <div className={styles.actions}>
          <Button size="sm" variant="ghost" onClick={reset}>
            {t('common.reset')}
          </Button>
          <CopyButton
            value={result.output}
            label={t('common.copy')}
            copiedLabel={t('common.copied')}
          />
        </div>
      </div>

      {result.error ? (
        <p className={styles.error} role="alert">
          {result.error}
        </p>
      ) : definition.outputRows ? (
        <pre className={styles.result}>{result.output || t('common.waitingForInput')}</pre>
      ) : (
        <TextArea
          value={result.output}
          readOnly
          placeholder={t('common.waitingForInput')}
          aria-label={t('common.output')}
        />
      )}
    </ToolLayout>
  );
}

export function createUtilityTool(definition: UtilityDefinition) {
  return function UtilityTool() {
    return <UtilityWorkbench definition={definition} />;
  };
}
