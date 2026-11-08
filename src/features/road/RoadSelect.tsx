import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import { useRoad, useRoadStore, useRoads } from './store';

type Variant = 'field' | 'header' | 'inline';

export function RoadSelect({ progress, variant = 'field', className }: { progress: Record<string, number>; variant?: Variant; className?: string }) {
  const i = useI18n();
  const { hint } = useSay();
  const road = useRoad();
  const setRoad = useRoadStore((s) => s.setRoad);
  const roads = useRoads();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('touchstart', away);
      window.removeEventListener('keydown', key);
    };
  }, [open]);

  const where = (r: typeof road) => i.t(`${r.from.en} to ${r.to.en}, ${r.area.en}`, `${r.from.bn} থেকে ${r.to.bn}, ${r.area.bn}`);
  const done = (id: string) => {
    const p = progress[id] ?? 0;
    return p === 0 ? i.t('Not started yet', 'এখনো শুরু হয়নি') : i.t(`${i.fixed(p)}% done`, `${i.fixed(p)}% শেষ`);
  };

  return (
    <div ref={box} className={cn('relative min-w-0', variant === 'field' && 'w-full', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={i.t(`Road: ${road.name.en}. Change road`, `রাস্তা: ${road.name.bn}। রাস্তা বদলান`)}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-w-0 items-center gap-2 text-left transition',
          variant === 'field' && 'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 hover:border-guide-600 hover:bg-guide-50',
          variant === 'field' && open && 'border-guide-600',
          variant === 'header' && 'py-1 font-semibold text-white hover:text-mark-300',
          variant === 'inline' && 'py-1 font-semibold text-guide-700',
        )}
      >
        {variant === 'field' ? (
          <span className="min-w-0 flex-1">
            <span className="block font-sign text-2xl leading-tight sm:text-3xl">{i.tx(road.name)}</span>
            <span className="block text-ink-soft">{where(road)}</span>
          </span>
        ) : (
          <span className="truncate">{i.tx(road.name)}</span>
        )}
        <ChevronDown className={cn('shrink-0 transition', variant === 'field' ? 'h-7 w-7 text-ink-soft' : 'h-4 w-4', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={i.t('Roads', 'রাস্তা')}
          className={cn(
            'absolute left-0 top-full z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-2xl bg-white p-1.5 text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-line',
            variant === 'field' ? 'w-full' : 'w-[min(26rem,calc(100vw-2rem))]',
          )}
        >
          {roads.map((r) => {
            const on = r.id === road.id;
            return (
              <li key={r.id} role="option" aria-selected={on}>
                <button
                  type="button"
                  onClick={() => {
                    hint(r.name);
                    setRoad(r.id);
                    setOpen(false);
                  }}
                  className={cn('w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-guide-50', on && 'text-guide-700')}
                >
                  <span className="block text-lg font-semibold leading-tight">{i.tx(r.name)}</span>
                  <span className="block text-sm text-ink-soft">{where(r)}</span>
                  <span className={cn('block text-sm font-semibold', (progress[r.id] ?? 0) === 0 ? 'text-ink-soft' : 'text-guide-700')}>
                    {i.fixed(r.lengthKm)} {i.t('km', 'কিমি')} · {done(r.id)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
