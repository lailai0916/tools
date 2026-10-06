import {
  Alert,
  Button,
  Checkbox,
  Segmented,
  DropdownSelectField,
  TextAreaField,
  TextField,
} from '@lailai0916/ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import CopyButton from '@/components/CopyButton';
import ToolLayout from '@/components/ToolLayout';
import { ToolGrid, ToolPane, ToolResults } from '@/components/ToolWorkspace';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import {
  calculateDateDifference,
  dateToMilliseconds,
  formatDateTime,
  formatTimestamp,
  timestampToMilliseconds,
  type DateZone,
  type TimestampUnit,
  type WeekendPattern,
} from '@/utils/curatedTimeUnits';
import styles from './styles.module.css';

type DateTimeMode = 'timestamp' | 'difference';
type SourceFormat = 'timestamp' | 'date';
const WEEKENDS: WeekendPattern[] = ['saturdaySunday', 'fridaySaturday', 'sunday'];
const today = () => formatDateTime(Date.now(), 'local').slice(0, 10);

export default function DateTime() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const mode: DateTimeMode = params.get('mode') === 'difference' ? 'difference' : 'timestamp';
  const unit: TimestampUnit = params.get('unit') === 'milliseconds' ? 'milliseconds' : 'seconds';
  const zone: DateZone = params.get('zone') === 'local' ? 'local' : 'utc';
  const source: SourceFormat = params.get('source') === 'date' ? 'date' : 'timestamp';
  const [input, setInput] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState(today);
  const [holidays, setHolidays] = useState('');
  const [weekend, setWeekend] = useState<WeekendPattern>('saturdaySunday');
  const [includeEnd, setIncludeEnd] = useState(false);
  const instant = useMemo(
    () =>
      source === 'timestamp'
        ? timestampToMilliseconds(input, unit)
        : dateToMilliseconds(input, zone),
    [input, source, unit, zone]
  );
  const difference = useMemo(
    () => calculateDateDifference(start, end, { holidays, weekend, includeEnd }),
    [start, end, holidays, weekend, includeEnd]
  );
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  const changeSource = (value: SourceFormat) => {
    if (instant.state === 'valid') {
      setInput(
        value === 'timestamp' ? formatTimestamp(instant.ms, unit) : formatDateTime(instant.ms, zone)
      );
    } else {
      setInput('');
    }
    update('source', value);
  };
  const useNow = () => {
    const ms = Date.now();
    setInput(source === 'timestamp' ? formatTimestamp(ms, unit) : formatDateTime(ms, zone));
  };
  const copy = (value: string) => (
    <CopyButton value={value} label={t('common.copy')} copiedLabel={t('common.copied')} />
  );
  const resultRow = (label: string, value: string) => ({
    label,
    value: <code className={styles.value}>{value}</code>,
    action: copy(value),
  });
  const calendar =
    difference.state === 'valid'
      ? `${difference.years} ${t('tools.dateTime.years')}, ${difference.months} ${t('tools.dateTime.months')}, ${difference.days} ${t('tools.dateTime.days')}`
      : '';

  return (
    <ToolLayout title={t('tools.dateTime.name')} description={t('tools.dateTime.description')}>
      <Segmented<DateTimeMode>
        value={mode}
        onChange={(value) => update('mode', value)}
        items={[
          { value: 'timestamp', label: t('tools.dateTime.mode.timestamp') },
          { value: 'difference', label: t('tools.dateTime.mode.difference') },
        ]}
        size="sm"
        orientation="horizontal"
        stackAt={480}
        ariaLabel={t('common.mode')}
      />
      {mode === 'timestamp' ? (
        <>
          <div className={styles.controls}>
            <DropdownSelectField
              label={t('tools.dateTime.source')}
              value={source}
              onValueChange={(value) => changeSource(value as SourceFormat)}
              options={[
                { value: 'timestamp', label: t('tools.dateTime.source.timestamp') },
                { value: 'date', label: t('tools.dateTime.source.date') },
              ]}
            />
            <DropdownSelectField
              label={t('tools.dateTime.unit')}
              value={unit}
              onValueChange={(value) => update('unit', value)}
              options={[
                { value: 'seconds', label: t('tools.dateTime.seconds') },
                { value: 'milliseconds', label: t('tools.dateTime.milliseconds') },
              ]}
            />
            <DropdownSelectField
              label={t('tools.dateTime.zone')}
              value={zone}
              onValueChange={(value) => update('zone', value)}
              options={[
                { value: 'utc', label: t('tools.dateTime.zone.utc') },
                { value: 'local', label: t('tools.dateTime.zone.local') },
              ]}
            />
          </div>
          <ToolGrid>
            <ToolPane
              title={t(`tools.dateTime.source.${source}`)}
              actions={
                <div className={styles.actions}>
                  <Button size="sm" variant="ghost" onClick={useNow}>
                    {t('tools.dateTime.useNow')}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={!input} onClick={() => setInput('')}>
                    {t('common.clear')}
                  </Button>
                </div>
              }
            >
              <TextField
                id="date-time-input"
                label={t('tools.dateTime.input')}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                monospace
                spellCheck={false}
                inputMode={source === 'timestamp' ? 'decimal' : 'text'}
                placeholder={
                  source === 'timestamp'
                    ? unit === 'seconds'
                      ? '1704067200'
                      : '1704067200000'
                    : '2024-01-01 00:00'
                }
                invalid={instant.state === 'invalid'}
                aria-describedby={
                  instant.state === 'invalid' ? 'date-time-error' : 'date-time-input-hint'
                }
              />
              {instant.state === 'invalid' && (
                <Alert id="date-time-error" variant="danger" role="alert">
                  {t(
                    source === 'timestamp'
                      ? 'tools.dateTime.timestampError'
                      : 'tools.dateTime.dateError'
                  )}
                </Alert>
              )}
              <p className={styles.note} id="date-time-input-hint">
                {t(
                  source === 'timestamp'
                    ? 'tools.dateTime.timestampHint'
                    : zone === 'utc'
                      ? 'tools.dateTime.utcHint'
                      : 'tools.dateTime.localHint'
                )}
              </p>
              <p className={styles.note}>
                {t('tools.dateTime.zoneName')}: {localZone}
              </p>
            </ToolPane>
            <ToolPane title={t('tools.dateTime.results')}>
              {instant.state === 'valid' ? (
                <ToolResults
                  rows={[
                    resultRow(t('tools.dateTime.seconds'), formatTimestamp(instant.ms, 'seconds')),
                    resultRow(
                      t('tools.dateTime.milliseconds'),
                      formatTimestamp(instant.ms, 'milliseconds')
                    ),
                    resultRow(t('tools.dateTime.utcDate'), formatDateTime(instant.ms, 'utc')),
                    resultRow(t('tools.dateTime.localDate'), formatDateTime(instant.ms, 'local')),
                  ]}
                />
              ) : (
                <p className={styles.note}>{t('tools.dateTime.timestampEmpty')}</p>
              )}
            </ToolPane>
          </ToolGrid>
        </>
      ) : (
        <>
          <ToolGrid>
            <ToolPane title={t('common.input')}>
              <div className={styles.dates}>
                <div className={styles.dateField}>
                  <TextField
                    id="date-time-start"
                    label={t('tools.dateTime.start')}
                    type="date"
                    value={start}
                    invalid={difference.state === 'invalid' && difference.reason !== 'holiday'}
                    onChange={(event) => setStart(event.target.value)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setStart(today())}>
                    {t('tools.dateTime.today')}
                  </Button>
                </div>
                <div className={styles.dateField}>
                  <TextField
                    id="date-time-end"
                    label={t('tools.dateTime.end')}
                    type="date"
                    value={end}
                    invalid={difference.state === 'invalid' && difference.reason !== 'holiday'}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setEnd(today())}>
                    {t('tools.dateTime.today')}
                  </Button>
                </div>
              </div>
              <DropdownSelectField
                label={t('tools.dateTime.weekend')}
                value={weekend}
                onValueChange={(value) => setWeekend(value as WeekendPattern)}
                options={WEEKENDS.map((value) => ({
                  value,
                  label: t(`tools.dateTime.weekend.${value}`),
                }))}
              />
              <Checkbox
                checked={includeEnd}
                onChange={(event) => setIncludeEnd(event.target.checked)}
                label={t('tools.dateTime.includeEnd')}
              />
              <TextAreaField
                id="date-time-holidays"
                label={t('tools.dateTime.holidays')}
                rows={3}
                value={holidays}
                monospace
                spellCheck={false}
                placeholder="2024-01-01"
                invalid={difference.state === 'invalid' && difference.reason === 'holiday'}
                aria-describedby="date-time-holidays-hint"
                onChange={(event) => setHolidays(event.target.value)}
              />
              <p id="date-time-holidays-hint" className={styles.note}>
                {t('tools.dateTime.holidaysHint')}
              </p>
              {difference.state === 'invalid' && (
                <Alert variant="danger" role="alert">
                  {t(`tools.dateTime.error.${difference.reason}` as MessageKey)}
                </Alert>
              )}
            </ToolPane>
            <ToolPane title={t('tools.dateTime.differenceResults')}>
              {difference.state === 'valid' ? (
                <ToolResults
                  rows={[
                    resultRow(t('tools.dateTime.calendar'), calendar),
                    resultRow(t('tools.dateTime.totalMonths'), String(difference.totalMonths)),
                    resultRow(t('tools.dateTime.elapsedDays'), String(difference.elapsedDays)),
                    resultRow(t('tools.dateTime.rangeDays'), String(difference.rangeDays)),
                    resultRow(t('tools.dateTime.businessDays'), String(difference.businessDays)),
                    resultRow(t('tools.dateTime.weekendDays'), String(difference.weekendDays)),
                    resultRow(
                      t('tools.dateTime.excludedHolidays'),
                      String(difference.excludedHolidays)
                    ),
                  ]}
                />
              ) : (
                <p className={styles.note}>{t('tools.dateTime.differenceEmpty')}</p>
              )}
            </ToolPane>
          </ToolGrid>
          <p className={styles.note}>{t('tools.dateTime.differenceHint')}</p>
        </>
      )}
    </ToolLayout>
  );
}
