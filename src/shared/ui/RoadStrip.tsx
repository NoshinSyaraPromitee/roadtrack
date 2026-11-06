import { Tractor } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { clamp, cn } from '@/shared/lib/utils';

interface RoadStripProps {
  progress: number;
  lengthKm: number;
  today?: { from: number; to: number };
  size?: 'md' | 'lg';
  showScale?: boolean;
  className?: string;
}

export function RoadStrip({ progress, lengthKm, today, size = 'md', showScale = true, className }: RoadStripProps) {
  const { t, num, fixed } = useI18n();
  const p = clamp(progress, 0, 100);
  const lg = size === 'lg';
  const ticks = Array.from({ length: Math.floor(lengthKm) + 1 }, (_, k) => k).filter((k) => k === 0 || lengthKm - k > lengthKm * 0.08);
  const paintFrom = today ? clamp(today.from, 0, 100) : 0;
  const paintTo = today ? clamp(today.to, 0, 100) : 0;
  const pin = lg ? 44 : 36;

  return (
    <div className={className}>
      <div className="relative" style={{ paddingTop: pin + 8 }} role="img" aria-label={t(`${fixed(p)} percent of the road is done`, `রাস্তার ${fixed(p)} শতাংশ কাজ শেষ`)}>
        <span
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-out"
          style={{ left: `${clamp(p, 2, 98)}%` }}
          aria-hidden="true"
        >
          <span className="grid place-items-center rounded-full bg-mark-400 text-ink ring-2 ring-ink" style={{ width: pin, height: pin }}>
            <Tractor className={lg ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2.4} />
          </span>
          <span className="h-2 w-0.5 bg-ink" />
        </span>
        <div className={cn('gravel relative overflow-hidden rounded-xl', lg ? 'h-14 sm:h-16' : 'h-11')}>
          <div className="absolute inset-y-0 left-0 bg-asphalt transition-[width] duration-700 ease-out" style={{ width: `${p}%` }}>
            <div className="absolute inset-x-0 top-[14%] h-[3px] bg-white/75" />
            <div className="absolute inset-x-0 bottom-[14%] h-[3px] bg-white/75" />
            <div className="road-dash absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2" />
          </div>
          {today && paintTo > paintFrom && (
            <div className="today-paint absolute inset-y-0 transition-all duration-700" style={{ left: `${paintFrom}%`, width: `${paintTo - paintFrom}%` }} />
          )}
          <div className="absolute inset-y-0 w-[3px] bg-mark-400" style={{ left: `calc(${p}% - 1.5px)` }} />
        </div>
      </div>
      {showScale && (
        <div className="relative mt-2 h-5 text-sm text-ink-soft" aria-hidden="true">
          {ticks.map((k) => (
            <span key={k} className={cn('absolute tabular-nums', k > 0 && '-translate-x-1/2')} style={{ left: `${(k / lengthKm) * 100}%` }}>
              {num(k)}
            </span>
          ))}
          <span className="absolute right-0 font-semibold tabular-nums text-ink">
            {fixed(lengthKm)} {t('km', 'কিমি')}
          </span>
        </div>
      )}
    </div>
  );
}
