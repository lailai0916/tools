import { Alert, Button, Checkbox, Icon, DropdownSelectField, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import TextArea from '@/components/TextArea';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import {
  dataInputFormats,
  dataOutputFormats,
  isDataInputFormat,
  parseDataWorkbenchParams,
  processDataWorkbench,
  updateDataWorkbenchParams,
  type DataWorkbenchOptions,
} from '@/utils/dataWorkbench';
import styles from './styles.module.css';

const samples = {
  json: '[\n  {"name":"Ada","active":true,"tags":["admin"]},\n  {"name":"Lin","active":false,"tags":[]}\n]',
  yaml: '- name: Ada\n  active: true\n  tags: [admin]\n- name: Lin\n  active: false\n  tags: []',
  csv: 'name,active,tags\nAda,true,"[""admin""]"\nLin,false,[]',
  tsv: 'name\tactive\ttags\nAda\ttrue\t"[""admin""]"\nLin\tfalse\t[]',
};

export default function DataWorkbench() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const options = useMemo(() => parseDataWorkbenchParams(params), [params]);
  const [input, setInput] = useState('');
  const result = useMemo(() => processDataWorkbench(input, options), [input, options]);
  const output = result.ok === true ? result.output : '';
  const canReuse = result.ok === true && isDataInputFormat(options.to);
  const tableMode =
    options.from === 'csv' ||
    options.from === 'tsv' ||
    options.to === 'csv' ||
    options.to === 'tsv';
  const inferenceMode = options.to === 'typescript' || options.to === 'json-schema';

  function setOptions(patch: Partial<DataWorkbenchOptions>) {
    setParams((previous) => updateDataWorkbenchParams(previous, { ...options, ...patch }), {
      replace: true,
    });
  }

  function reuseOutput(swap: boolean) {
    if (!canReuse || !isDataInputFormat(options.to)) return;
    setInput(output);
    setOptions({
      from: options.to,
      ...(swap ? { to: options.from } : {}),
      flatten: false,
    });
  }

  return (
    <ToolLayout
      title={t('tools.dataWorkbench.name')}
      description={t('tools.dataWorkbench.description')}
    >
      <div className={styles.formats}>
        <DropdownSelectField
          label={t('tools.dataWorkbench.from')}
          value={options.from}
          onValueChange={(from) => {
            if (isDataInputFormat(from)) setOptions({ from });
          }}
          options={dataInputFormats.map((format) => ({
            value: format,
            label: t(`tools.dataWorkbench.${format}`),
          }))}
        />
        <Button
          variant="ghost"
          size="sm"
          className={styles.swap}
          disabled={!isDataInputFormat(options.to)}
          onClick={() => {
            if (canReuse) reuseOutput(true);
            else if (isDataInputFormat(options.to)) {
              setOptions({ from: options.to, to: options.from });
            }
          }}
          aria-label={t('tools.dataWorkbench.swap')}
          title={t('tools.dataWorkbench.swap')}
        >
          <Icon icon="lucide:arrow-left-right" width={18} height={18} aria-hidden="true" />
          {t('tools.dataWorkbench.swap')}
        </Button>
        <DropdownSelectField
          label={t('tools.dataWorkbench.to')}
          value={options.to}
          onValueChange={(value) => {
            const to = dataOutputFormats.find((format) => format === value);
            if (to) setOptions({ to });
          }}
          options={dataOutputFormats.map((format) => ({
            value: format,
            label: t(`tools.dataWorkbench.${format}`),
          }))}
        />
      </div>

      <div className={styles.options}>
        <DropdownSelectField
          wrapperClassName={styles.indent}
          label={t('tools.dataWorkbench.indent')}
          value={String(options.indent)}
          onValueChange={(value) => {
            const indent = Number(value);
            if (indent === 0 || indent === 2 || indent === 4) setOptions({ indent });
          }}
          disabled={options.to === 'csv' || options.to === 'tsv'}
          options={[
            { value: '2', label: t('tools.dataWorkbench.twoSpaces') },
            { value: '4', label: t('tools.dataWorkbench.fourSpaces') },
            { value: '0', label: t('tools.dataWorkbench.compact') },
          ]}
        />
        <div className={styles.checks}>
          <Checkbox
            label={t('tools.dataWorkbench.sort')}
            checked={options.sort}
            onChange={(event) => setOptions({ sort: event.target.checked })}
          />
          <Checkbox
            label={t('tools.dataWorkbench.flatten')}
            checked={options.flatten}
            onChange={(event) => setOptions({ flatten: event.target.checked })}
          />
        </div>
        {inferenceMode && (
          <TextField
            wrapperClassName={styles.root}
            label={t('tools.dataWorkbench.root')}
            value={options.root}
            onChange={(event) => setOptions({ root: event.target.value })}
            monospace
          />
        )}
      </div>

      <ToolGrid>
        <ToolPane
          title={t('common.input')}
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(samples[options.from])}>
                {t('tools.dataWorkbench.sample')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
                {t('common.clear')}
              </Button>
            </>
          }
        >
          <TextArea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={samples[options.from]}
            invalid={result.ok === false}
            aria-label={t('common.input')}
          />
          {result.ok === false && (
            <Alert variant="danger">
              {t(`tools.dataWorkbench.error.${result.code}`)}
              {result.code === 'parse' && <pre className={styles.errorDetail}>{result.detail}</pre>}
            </Alert>
          )}
        </ToolPane>
        <ToolPane
          title={t('common.output')}
          actions={
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => reuseOutput(false)}
                disabled={!canReuse}
              >
                {t('tools.dataWorkbench.continue')}
              </Button>
              <CopyButton
                value={output}
                label={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
            </>
          }
        >
          <TextArea value={output} readOnly aria-label={t('common.output')} />
        </ToolPane>
      </ToolGrid>

      {tableMode && <p className={styles.note}>{t('tools.dataWorkbench.tableNote')}</p>}
      {options.flatten && <p className={styles.note}>{t('tools.dataWorkbench.flattenNote')}</p>}
      {inferenceMode && (
        <div className={styles.notes}>
          <p className={styles.note}>{t('tools.dataWorkbench.inferenceNote')}</p>
          <p className={styles.note}>{t('tools.dataWorkbench.generatedNote')}</p>
        </div>
      )}
    </ToolLayout>
  );
}
