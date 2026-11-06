import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mark' | 'sign' | 'onDark' | 'choice' | 'chosen';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const variants: Record<Variant, string> = {
  primary: 'bg-guide-600 text-white hover:bg-guide-700',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-black/5 hover:text-ink',
  danger: 'bg-stop-500 text-white hover:bg-stop-600',
  mark: 'bg-mark-400 text-ink hover:bg-mark-300',
  sign: 'bg-sign-500 text-white hover:bg-sign-600',
  onDark: 'bg-white/12 text-white hover:bg-white/20',
  /** One of a pair of choices, not picked yet: plain, with no hover colour. */
  choice: 'bg-white text-ink ring-1 ring-inset ring-line',
  /** The picked choice: coloured, and only this one reacts to hover. */
  chosen: 'bg-guide-600 text-white hover:bg-guide-700',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm [&_svg]:size-4',
  md: 'h-11 gap-2 rounded-xl px-4 text-base [&_svg]:size-5',
  lg: 'h-14 gap-2.5 rounded-2xl px-5 text-lg [&_svg]:size-6',
  xl: 'h-16 gap-3 rounded-2xl px-7 text-xl [&_svg]:size-7',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold transition disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
