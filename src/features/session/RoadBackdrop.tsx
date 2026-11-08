import { useState } from 'react';
import { useRoad } from '@/features/road';

const FALLBACK = '/scenes/site-banner.svg';

/** The chosen road's photo behind the page, faded under a white wash so the form stays easy to read. */
export function RoadBackdrop() {
  const road = useRoad();
  const [broken, setBroken] = useState<string | null>(null);
  const src = road.photo && broken !== road.photo ? road.photo : FALLBACK;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={src} alt="" onError={() => setBroken(road.photo ?? null)} className="h-full w-full scale-105 object-cover opacity-50 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
    </div>
  );
}
