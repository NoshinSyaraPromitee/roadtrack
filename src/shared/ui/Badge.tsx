import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

const tones: Record<Tone, string> = {
  green: 'bg-guide-50 text-guide-700 ring-guide-200',
  yellow: 'bg-mark-100 text-mark-800 ring-mark-300',
  red: 'bg-stop-50 text-stop-700 ring-stop-100',
  blue: 'bg-sign-50 text-sign-600 ring-sign-100',
  neutral: 'bg-white text-ink-soft ring-line',
};

/** Status chips always pair a colour with an icon, so colour is never the only signal. */
export function Badge({ tone = 'neutral', icon: Icon, children, className }: { tone?: Tone; icon?: IconType; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset', tones[tone], className)}>
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2.4} />}
      {children}
    </span>
  );
}