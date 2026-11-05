import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Card({ className, tone = 'default', children }: { className?: string; tone?: 'default' | 'alert'; children: ReactNode }) {
  return (
    <section
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-colors',
        tone === 'alert' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300' : 'border-zinc-200 bg-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }: { title: string; subtitle?: string; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="font-bold text-zinc-900">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}