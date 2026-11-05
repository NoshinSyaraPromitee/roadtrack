import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';
import { Pictogram } from './Pictogram';
import type { PictoShape, PictoTone } from './Pictogram';

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'guide',
  shape = 'plate',
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: IconType;
  tone?: PictoTone;
  shape?: PictoShape;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-start sm:gap-3', className)}>
      <Pictogram icon={icon} tone={tone} shape={shape} size={40} />
      <div className="min-w-0">
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="mt-0.5 font-sign text-[1.7rem] leading-none tabular-nums sm:text-3xl">{value}</p>
        {hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
}