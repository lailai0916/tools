import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button as SharedButton } from '@lailai/ui';
import clsx from 'clsx';
import styles from './styles.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    active,
    fullWidth = false,
    leftIcon,
    type = 'button',
    className,
    ...rest
  },
  ref
) {
  return (
    <SharedButton
      ref={ref}
      type={type}
      variant={variant === 'ghost' ? 'quiet' : variant}
      size={size === 'sm' ? 'small' : 'medium'}
      className={clsx(fullWidth && styles.fullWidth, className)}
      aria-pressed={active}
      {...rest}
    >
      {leftIcon != null && <span className={styles.icon}>{leftIcon}</span>}
      {children != null && <span className={styles.label}>{children}</span>}
    </SharedButton>
  );
});

export default Button;
