import { cn } from '@/shared/lib/utils';

export function StackBar({ parts, total, className }: { parts: Array<{ value: number; className: string }>; total: number; className?: string }) {
  return (
    <div className={cn('flex h-3 w-full overflow-hidden rounded-full bg-line', className)} aria-hidden="true">
      {parts.map((p, i) => (
        <div key={i} className={cn('h-full transition-all duration-500', p.className)} style={{ width: `${total > 0 ? (p.value / total) * 100 : 0}%` }} />
      ))}
    </div>
  );
}