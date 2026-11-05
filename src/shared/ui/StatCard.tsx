import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, accent = false }: Props) {
  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm', accent ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 bg-white')}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-xs font-semibold uppercase tracking-wide', accent ? 'text-zinc-400' : 'text-zinc-500')}>{label}</p>
        <Icon className={cn('h-4 w-4', accent ? 'text-amber-400' : 'text-amber-600')} />
      </div>
      <p className="mt-2 truncate text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {hint && <p className={cn('mt-1 truncate text-xs', accent ? 'text-zinc-400' : 'text-zinc-500')}>{hint}</p>}
    </div>
  );
}