import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type SecretInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  showLabel: string;
  hideLabel: string;
  invalid?: boolean;
};

const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>(function SecretInput(
  { showLabel, hideLabel, invalid = false, className, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? hideLabel : showLabel;

  return (
    <div className={styles.control}>
      <input
        ref={ref}
        {...rest}
        type={visible ? 'text' : 'password'}
        className={clsx(styles.input, invalid && styles.invalid, className)}
        aria-invalid={rest['aria-invalid'] ?? (invalid || undefined)}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        className={styles.toggle}
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={actionLabel}
        aria-pressed={visible}
      >
        {actionLabel}
      </button>
    </div>
  );
});

export default SecretInput;
