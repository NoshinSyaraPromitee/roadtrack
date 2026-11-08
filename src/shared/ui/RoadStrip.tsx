import { useState } from 'react';
import { useI18n } from '@/shared/i18n';
import { clamp, cn } from '@/shared/lib/utils';
import { ConeArt, RollerArt } from './RoadArt';

const VERGE = { backgroundColor: '#8fbf6e', backgroundImage: 'radial-gradient(#6fa452 1.2px, transparent 1.4px), radial-gradient(#a9d18e 1px, transparent 1.2px)', backgroundSize: '8px 8px, 11px 11px' };
const GRAVEL = { backgroundColor: '#e4d9c3', backgroundImage: 'radial-gradient(#c4b496 1.1px, transparent 1.3px), radial-gradient(#d3c6ab 1px, transparent 1.2px)', backgroundSize: '9px 9px, 6px 6px', backgroundPosition: '0 0, 3px 4px' };
const ASPHALT = { backgroundColor: '#23292c', backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.2px), radial-gradient(rgba(0,0,0,0.3) 1px, transparent 1.2px)', backgroundSize: '6px 6px, 9px 9px', backgroundPosition: '0 0, 3px 2px' };
const KERB = { backgroundImage: 'repeating-linear-gradient(90deg, #1f2523 0 12px, #f2a91c 12px 24px)' };
const DASH = { backgroundImage: 'repeating-linear-gradient(90deg, #ffffff 0 16px, transparent 16px 30px)' };
const TODAY = { backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255, 201, 48, 0.95) 0 8px, rgba(255, 201, 48, 0.7) 8px 16px)' };

/** The truck photo that rides on the progress point. If it is missing, the drawn roller is used instead. */
const TRUCK = '/bangladeshi-truck.png';

function Vehicle({ height }: { height: number }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <RollerArt width={height * 1.4} className="-scale-x-100" />;
  return <img src={TRUCK} alt="" draggable={false} onError={() => setBroken(true)} className="block w-auto max-w-none select-none drop-shadow-[0_3px_3px_rgba(0,0,0,0.25)]" style={{ height }} />;
}

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
  const truck = lg ? 74 : 62;
  const cone = lg ? 22 : 18;

  return (
    <div className={className}>
      <div className="relative" style={{ paddingTop: truck * 0.88 }} role="img" aria-label={t(`${fixed(p)} percent of the road is done`, `রাস্তার ${fixed(p)} শতাংশ কাজ শেষ`)}>
        <span className="absolute top-0 z-10 -translate-x-[85%] transition-[left] duration-700 ease-out" style={{ left: `${clamp(p, 6, 98)}%` }}>
          <Vehicle height={truck} />
        </span>
        <div className="rounded-xl px-0 py-[5px]" style={VERGE}>
          <div className={cn('relative overflow-hidden', lg ? 'h-14 sm:h-16' : 'h-11')} style={GRAVEL}>
            <div className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out" style={{ ...ASPHALT, width: `${p}%` }}>
              <div className="absolute inset-x-0 top-0 h-[5px]" style={KERB} />
              <div className="absolute inset-x-0 bottom-0 h-[5px]" style={KERB} />
              <div className="absolute inset-x-0 top-[22%] h-[2px] bg-white/70" />
              <div className="absolute inset-x-0 bottom-[22%] h-[2px] bg-white/70" />
              <div className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2" style={DASH} />
            </div>
            {today && paintTo > paintFrom && (
              <div className="absolute inset-y-0 transition-all duration-700" style={{ ...TODAY, left: `${paintFrom}%`, width: `${paintTo - paintFrom}%` }} />
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
