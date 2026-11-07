import { useI18n } from '@/shared/i18n';
import { clamp, cn } from '@/shared/lib/utils';
import { ConeArt, RollerArt } from './RoadArt';

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
  const roller = lg ? 72 : 58;
  const cone = lg ? 22 : 18;

  return (
    <div className={className}>
      <div className="relative" style={{ paddingTop: roller * 0.82 }} role="img" aria-label={t(`${fixed(p)} percent of the road is done`, `রাস্তার ${fixed(p)} শতাংশ কাজ শেষ`)}>
        <span className="absolute top-0 z-10 -translate-x-[78%] -scale-x-100 transition-[left] duration-700 ease-out" style={{ left: `${clamp(p, 4, 97)}%` }}>
          <RollerArt width={roller} />
        </span>
        <div className="verge rounded-xl px-0 py-[5px]">
          <div className={cn('gravel relative overflow-hidden', lg ? 'h-14 sm:h-16' : 'h-11')}>
            <div className="asphalt absolute inset-y-0 left-0 transition-[width] duration-700 ease-out" style={{ width: `${p}%` }}>
              <div className="kerb absolute inset-x-0 top-0 h-[5px]" />
              <div className="kerb absolute inset-x-0 bottom-0 h-[5px]" />
              <div className="absolute inset-x-0 top-[22%] h-[2px] bg-white/70" />
              <div className="absolute inset-x-0 bottom-[22%] h-[2px] bg-white/70" />
              <div className="road-dash absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2" />
            </div>
            {today && paintTo > paintFrom && (
              <div className="today-paint absolute inset-y-0 transition-all duration-700" style={{ left: `${paintFrom}%`, width: `${paintTo - paintFrom}%` }} />
            )}
            <div className="absolute inset-y-0 w-[3px] bg-mark-400" style={{ left: `calc(${p}% - 1.5px)` }} />
            {p < 97 && (
              <span className="absolute bottom-[6px] flex gap-1 transition-[left] duration-700" style={{ left: `calc(${p}% + 8px)` }} aria-hidden="true">
                <ConeArt height={cone} />
                <ConeArt height={cone} />
              </span>
            )}
          </div>
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
