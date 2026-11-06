import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

const tones: Record<Tone, string> = {
  green: 'text-guide-700',
  yellow: 'text-[#9a5b00]',
  red: 'text-stop-600',
  blue: 'text-sign-600',
  neutral: 'text-ink-soft',
};

/** A status label in coloured text, with no background. The icon prop is accepted but not drawn. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; icon?: IconType; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
