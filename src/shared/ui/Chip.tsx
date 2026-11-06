import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Chip({ selected, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 font-semibold transition [&_svg]:size-5',
        selected ? 'border-guide-600 bg-white text-guide-700' : 'border-line bg-white text-ink hover:border-ink-soft/40',
        className,
      )}
      {...props}
    />
  );
}
