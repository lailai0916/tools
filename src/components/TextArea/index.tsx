import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  monospace?: boolean;
  invalid?: boolean;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { monospace = true, invalid = false, className, spellCheck = false, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      spellCheck={spellCheck}
      className={clsx(
        styles.textarea,
        monospace && styles.mono,
        invalid && styles.invalid,
        className
      )}
      {...rest}
    />
  );
});

export default TextArea;
