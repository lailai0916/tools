import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import styles from './styles.module.css';

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  disabled?: boolean;
};

export default function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  className,
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = useCallback(async () => {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for non-secure contexts / older browsers.
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <button
      type="button"
      className={clsx(styles.copy, copied && styles.copied, className)}
      onClick={onClick}
      disabled={disabled || !value}
      aria-live="polite"
    >
      <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className={styles.icon} />
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
