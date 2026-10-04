import { forwardRef } from 'react';
import { TextArea as SharedTextArea, type TextAreaProps } from '@lailai0916/ui';
import clsx from 'clsx';
import styles from './styles.module.css';

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { monospace = true, className, spellCheck = false, ...props },
  ref
) {
  return (
    <SharedTextArea
      {...props}
      ref={ref}
      monospace={monospace}
      spellCheck={spellCheck}
      className={clsx(styles.editor, className)}
    />
  );
});

export default TextArea;
