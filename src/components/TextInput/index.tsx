import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  monospace?: boolean;
  invalid?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { monospace = false, invalid = false, className, spellCheck = false, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      spellCheck={spellCheck}
      className={clsx(styles.input, monospace && styles.mono, invalid && styles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export default TextInput;
