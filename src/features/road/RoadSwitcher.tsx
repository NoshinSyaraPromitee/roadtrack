import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { RoadPicker } from './RoadPicker';
import { useRoad, useRoadStore } from './store';

/** The road name in the header. Tap it to move to another road. */
export function RoadSwitcher({ progress, variant = 'header' }: { progress: Record<string, number>; variant?: 'header' | 'page' }) {
  const i = useI18n();
  const road = useRoad();
  const setRoad = useRoadStore((s) => s.setRoad);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex min-w-0 items-center gap-1.5 py-1 text-left font-semibold transition',
          variant === 'header' ? 'px-1 text-white hover:text-mark-300' : 'text-guide-700 hover:text-guide-800',
        )}
        aria-label={i.t(`Road: ${road.name.en}. Change road`, `রাস্তা: ${road.name.bn}। রাস্তা বদলান`)}
      >
        <MapPin className={cn('h-5 w-5 shrink-0', variant === 'header' ? 'text-mark-400' : 'text-guide-600')} />
        <span className="truncate">{i.tx(road.name)}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0', variant === 'header' ? 'text-white/70' : 'text-guide-600')} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button type="button" aria-label={i.t('Close', 'বন্ধ করুন')} onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-ink/40" />
          <section role="dialog" aria-modal="true" className="relative max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-paper p-4 text-ink sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-sign text-3xl">{i.t('Choose a road', 'রাস্তা বেছে নিন')}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={i.t('Close', 'বন্ধ করুন')} className="grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:text-ink">
                <X className="h-6 w-6" />
              </button>
            </div>
            <RoadPicker
              value={road.id}
              progress={progress}
              onPick={(r) => {
                setRoad(r.id);
                setOpen(false);
              }}
            />
          </section>
        </div>
      )}
    </>
  );
}
