import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-amber-600">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}