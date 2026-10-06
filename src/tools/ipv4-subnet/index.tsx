import { Alert, Segmented, TextField } from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import ToolLayout from '@/components/ToolLayout';
import { curatedWebGuides } from '@/content/toolGuides/curatedWeb';
import { ToolGrid, ToolPane, ToolResults } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { CuratedWebError, inspectIpv4, type Ipv4Format } from '@/utils/curatedWeb';
import styles from './styles.module.css';

const FORMATS: Ipv4Format[] = ['ipv4', 'decimal', 'hex', 'binary'];
const INITIAL = inspectIpv4('192.168.1.10', '24');

export default function Ipv4Workbench() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('format');
  const format: Ipv4Format = FORMATS.includes(requested as Ipv4Format)
    ? (requested as Ipv4Format)
    : 'ipv4';
  const text = (key: string) => t(`tools.ipv4Subnet.${key}` as MessageKey);
  const [address, setAddress] = useState<string>(INITIAL.address);
  const [draft, setDraft] = useState<{ format: Ipv4Format; value: string } | null>(null);
  const [prefix, setPrefix] = useState('24');
  const canonical = inspectIpv4(address, '32');
  const input =
    draft?.format === format ? draft.value : canonical[format === 'ipv4' ? 'address' : format];
  const result = useMemo(() => {
    if (!input) return { data: null, error: '' };
    try {
      return { data: inspectIpv4(input, prefix, format), error: '' };
    } catch (error) {
      return { data: null, error: error instanceof CuratedWebError ? error.code : 'ipv4' };
    }
  }, [input, prefix, format]);
  const updateInput = (value: string) => {
    setDraft({ format, value });
    try {
      setAddress(inspectIpv4(value, '32', format).address);
    } catch {
      /* Preserve invalid drafts while editing. */
    }
  };
  const changeFormat = (next: Ipv4Format) => {
    try {
      setAddress(inspectIpv4(input, '32', format).address);
      setDraft(null);
    } catch {
      setDraft({ format: next, value: input });
    }
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.set('format', next);
        return params;
      },
      { replace: true }
    );
  };
  const data = result.data;
  const copy = (value: string) => (
    <CopyButton value={value} label={t('common.copy')} copiedLabel={t('common.copied')} />
  );
  const rows = data
    ? [
        ...(['address', 'decimal', 'binary', 'hex'] as const).map((key) => ({
          label: text(key === 'address' ? 'ipv4' : key),
          value: data[key],
          action: copy(data[key]),
        })),
        { label: text('network'), value: `${data.network}/${data.prefix}` },
        { label: text('netmask'), value: data.netmask },
        {
          label: text('broadcast'),
          value: data.prefix >= 31 ? text('noBroadcast') : data.broadcast,
        },
        { label: text('total'), value: data.total.toLocaleString() },
        { label: text('usable'), value: data.usable.toLocaleString() },
        { label: text('range'), value: `${data.firstHost} – ${data.lastHost}` },
      ]
    : [];

  return (
    <ToolLayout
      guide={curatedWebGuides.ipv4Subnet}
      title={text('name')}
      description={text('description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <Segmented<Ipv4Format>
          value={format}
          onChange={changeFormat}
          items={FORMATS.map((value) => ({ value, label: text(value) }))}
          size="sm"
          orientation="horizontal"
          ariaLabel={text('format')}
        />
      </div>
      <ToolGrid>
        <ToolPane title={t('common.input')}>
          <div className={styles.fields}>
            <TextField
              label={text('address')}
              value={input}
              onChange={(event) => updateInput(event.target.value)}
              monospace
              spellCheck={false}
              invalid={result.error === 'ipv4'}
            />
            <TextField
              label={text('prefix')}
              type="number"
              min="0"
              max="32"
              step="1"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              invalid={result.error === 'prefix'}
            />
            <p className={styles.hint}>{text('smallSubnet')}</p>
          </div>
        </ToolPane>
        <ToolPane title={t('common.output')}>
          {result.error ? (
            <Alert variant="danger" role="alert">
              {t(`webError.${result.error}` as MessageKey)}
            </Alert>
          ) : data ? (
            <ToolResults rows={rows} />
          ) : (
            <p className={styles.hint}>{t('common.waitingForInput')}</p>
          )}
        </ToolPane>
      </ToolGrid>
    </ToolLayout>
  );
}
