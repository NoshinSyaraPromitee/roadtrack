import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mark' | 'sign' | 'onDark';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const variants: Record<Variant, string> = {
  primary: 'bg-guide-600 text-white shadow-[0_3px_0_0_var(--color-guide-800)] hover:bg-guide-700',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line shadow-[0_2px_0_0_var(--color-line)] hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-black/5 hover:text-ink',
  danger: 'bg-stop-500 text-white shadow-[0_3px_0_0_var(--color-stop-700)] hover:bg-stop-600',
  mark: 'bg-mark-400 text-ink shadow-[0_3px_0_0_var(--color-mark-600)] hover:bg-mark-300',
  sign: 'bg-sign-500 text-white shadow-[0_3px_0_0_var(--color-sign-800)] hover:bg-sign-600',
  onDark: 'bg-white/12 text-white hover:bg-white/20',
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
        'inline-flex shrink-0 items-center justify-center font-semibold transition active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}