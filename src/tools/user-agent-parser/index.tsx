import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import styles from './styles.module.css';

type UaInfo = {
  browser: string | null;
  os: string | null;
  engine: string | null;
  device: string | null;
};

function parseBrowser(ua: string): string | null {
  const tests: { re: RegExp; name: string }[] = [
    { re: /Edg(?:A|iOS)?\/([\d.]+)/, name: 'Edge' },
    { re: /OPR\/([\d.]+)/, name: 'Opera' },
    { re: /Opera[/ ]([\d.]+)/, name: 'Opera' },
    { re: /SamsungBrowser\/([\d.]+)/, name: 'Samsung Internet' },
    { re: /Firefox\/([\d.]+)/, name: 'Firefox' },
    { re: /FxiOS\/([\d.]+)/, name: 'Firefox' },
    { re: /CriOS\/([\d.]+)/, name: 'Chrome' },
    { re: /Chrome\/([\d.]+)/, name: 'Chrome' },
    { re: /Version\/([\d.]+).*Safari/, name: 'Safari' },
    { re: /MSIE ([\d.]+)/, name: 'Internet Explorer' },
    { re: /Trident\/.*rv:([\d.]+)/, name: 'Internet Explorer' },
  ];
  for (const { re, name } of tests) {
    const m = ua.match(re);
    if (m) {
      return m[1] ? `${name} ${m[1]}` : name;
    }
  }
  return null;
}

function windowsName(nt: string): string {
  switch (nt) {
    case '10.0':
      return '10 / 11';
    case '6.3':
      return '8.1';
    case '6.2':
      return '8';
    case '6.1':
      return '7';
    case '6.0':
      return 'Vista';
    case '5.1':
      return 'XP';
    default:
      return nt;
  }
}

function parseOs(ua: string): string | null {
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    return `Windows ${windowsName(m[1])}`;
  }
  if ((m = ua.match(/Android ([\d.]+)/))) {
    return `Android ${m[1]}`;
  }
  if ((m = ua.match(/(?:iPhone|iPad|iPod).*?OS ([\d_]+)/))) {
    return `iOS ${m[1].replace(/_/g, '.')}`;
  }
  if ((m = ua.match(/Mac OS X ([\d_]+)/))) {
    return `macOS ${m[1].replace(/_/g, '.')}`;
  }
  if (/CrOS/.test(ua)) {
    return 'ChromeOS';
  }
  if (/Linux/.test(ua)) {
    return 'Linux';
  }
  return null;
}

function parseEngine(ua: string): string | null {
  if (/Trident\//.test(ua)) {
    return 'Trident';
  }
  if (/Firefox\//.test(ua) || /Gecko\/\d/.test(ua)) {
    return 'Gecko';
  }
  if (/Presto\//.test(ua)) {
    return 'Presto';
  }
  if (/Edge\//.test(ua)) {
    return 'EdgeHTML';
  }
  if (/(?:Chrome|Chromium|Edg|OPR)\//.test(ua)) {
    return 'Blink';
  }
  if (/AppleWebKit\//.test(ua)) {
    return 'WebKit';
  }
  return null;
}

function parseDevice(ua: string): string {
  if (/bot|crawler|spider|slurp|bingpreview|duckduckbot/i.test(ua)) {
    return 'bot';
  }
  if (/iPad|Tablet|Nexus (?:7|9|10)|Kindle|Silk|PlayBook/i.test(ua)) {
    return 'tablet';
  }
  if (/Android/.test(ua) && !/Mobile/.test(ua)) {
    return 'tablet';
  }
  if (/Mobi|iPhone|iPod|Windows Phone|IEMobile|BlackBerry/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function parse(ua: string): UaInfo {
  return {
    browser: parseBrowser(ua),
    os: parseOs(ua),
    engine: parseEngine(ua),
    device: parseDevice(ua),
  };
}

export default function UserAgentParser() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const info = useMemo(() => parse(input.trim()), [input]);
  const hasInput = input.trim() !== '';

  const rows: { labelKey: MessageKey; value: string | null }[] = [
    { labelKey: 'tools.userAgentParser.browser', value: info.browser },
    { labelKey: 'tools.userAgentParser.os', value: info.os },
    { labelKey: 'tools.userAgentParser.engine', value: info.engine },
    { labelKey: 'tools.userAgentParser.device', value: info.device },
  ];

  return (
    <ToolLayout
      title={t('tools.userAgentParser.name')}
      description={t('tools.userAgentParser.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Icon icon="lucide:monitor-smartphone" />}
            onClick={() => setInput(navigator.userAgent)}
          >
            {t('tools.userAgentParser.useMine')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {t('common.clear')}
          </Button>
        </div>
      </div>

      <TextArea
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('tools.userAgentParser.placeholder')}
        aria-label={t('common.input')}
      />

      {hasInput && (
        <div className={styles.results}>
          {rows.map(({ labelKey, value }) => (
            <div className={styles.row} key={labelKey}>
              <span className={styles.rowLabel}>{t(labelKey)}</span>
              <code className={styles.rowValue} data-unknown={value === null}>
                {value ?? t('tools.userAgentParser.unknown')}
              </code>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
