import { ToolPane } from '@/components/ToolWorkspace';
import { Alert, Button, Checkbox, TextField } from '@lailai0916/ui';
import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { generatorGuides } from '@/content/toolGuides/generator';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import {
  MAX_RANDOM_NUMBER_COUNT,
  buildRandomNumbers,
  parseDecimalInteger,
  validateRandomNumberParams,
} from '@/utils/randomNumber';
import styles from './styles.module.css';

export default function RandomNumber() {
  const { t } = useI18n();
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(false);
  const [output, setOutput] = useState(() => buildRandomNumbers('1', '100', '5', false));

  const parsedCount = parseDecimalInteger(count);
  const validCount =
    parsedCount !== null && parsedCount >= 1 && parsedCount <= MAX_RANDOM_NUMBER_COUNT;
  const params = validateRandomNumberParams(min, max, count);
  const parsedMin = parseDecimalInteger(min);
  const parsedMax = parseDecimalInteger(max);
  const rangeTooWide =
    parsedMin !== null &&
    parsedMax !== null &&
    parsedMin <= parsedMax &&
    BigInt(parsedMax) - BigInt(parsedMin) + 1n > BigInt(Number.MAX_SAFE_INTEGER);
  const tooManyUnique = !!params && unique && params.k > params.size;
  const error = !validCount
    ? t('tools.randomNumber.invalidCount')
    : !params
      ? t(rangeTooWide ? 'tools.randomNumber.invalidRangeSize' : 'tools.randomNumber.invalidRange')
      : tooManyUnique
        ? t('tools.randomNumber.tooManyUnique')
        : '';
  const invalid = !!error;
  const inputDescription = invalid
    ? 'random-number-format random-number-error'
    : 'random-number-format';

  const run = (minS = min, maxS = max, countS = count, uniq = unique) => {
    setOutput(buildRandomNumbers(minS, maxS, countS, uniq));
  };

  return (
    <ToolLayout
      guide={generatorGuides.randomNumber}
      title={t('tools.randomNumber.name')}
      description={t('tools.randomNumber.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.options}>
        <div className={styles.fields}>
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.min')}
            id="rn-min"
            type="number"
            value={min}
            invalid={validCount && !params}
            aria-describedby={inputDescription}
            onChange={(e) => {
              setMin(e.target.value);
              run(e.target.value, max, count, unique);
            }}
            aria-label={t('tools.randomNumber.min')}
          />
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.max')}
            id="rn-max"
            type="number"
            value={max}
            invalid={validCount && !params}
            aria-describedby={inputDescription}
            onChange={(e) => {
              setMax(e.target.value);
              run(min, e.target.value, count, unique);
            }}
            aria-label={t('tools.randomNumber.max')}
          />
          <TextField
            wrapperClassName={styles.field}
            label={t('tools.randomNumber.count')}
            id="rn-count"
            type="number"
            min={1}
            max={MAX_RANDOM_NUMBER_COUNT}
            value={count}
            invalid={!validCount || tooManyUnique}
            aria-describedby={inputDescription}
            onChange={(e) => {
              setCount(e.target.value);
              run(min, max, e.target.value, unique);
            }}
            aria-label={t('tools.randomNumber.count')}
          />
        </div>
        <p className={styles.hint} id="random-number-format">
          {t('tools.randomNumber.integerFormat')}
        </p>
        <Checkbox
          checked={unique}
          onChange={(e) => {
            setUnique(e.target.checked);
            run(min, max, count, e.target.checked);
          }}
          label={t('tools.randomNumber.unique')}
        />
      </div>

      <ToolPane
        title={t('tools.randomNumber.output')}
        actions={
          <div className={styles.actions}>
            <Button size="sm" variant="primary" onClick={() => run()} disabled={invalid}>
              {t('tools.randomNumber.regenerate')}
            </Button>
            <CopyButton
              value={output}
              label={t('common.copy')}
              copiedLabel={t('common.copied')}
              disabled={invalid}
            />
          </div>
        }
      >
        {invalid ? (
          <Alert id="random-number-error" variant="danger" role="alert">
            {error}
          </Alert>
        ) : (
          <TextArea value={output} readOnly rows={6} aria-label={t('tools.randomNumber.output')} />
        )}
      </ToolPane>
    </ToolLayout>
  );
}
