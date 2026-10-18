import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cx } from '../../lib/format';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
  iconOnly?: boolean;
}

function classes({ variant = 'primary', size = 'md', block, iconOnly }: CommonProps, extra?: string) {
  return cx('btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', iconOnly && 'btn--icon', extra);
}

export function Button({ variant, size, icon, iconRight, block, iconOnly, className, children, type = 'button', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block, iconOnly }, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, iconRight, block, iconOnly, className, children, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={classes({ variant, size, block, iconOnly }, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
