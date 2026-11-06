import { ArrowRight, Check, MapPin } from 'lucide-react';
import type { Road } from '@/core/types';
import { ROADS } from '@/core/roads';
import { useI18n } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { RoadStrip } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

/** Big road cards: name, where it runs from and to, and how much is done. */
export function RoadPicker({ value, progress, onPick }: { value?: string; progress: Record<string, number>; onPick: (road: Road) => void }) {
  const i = useI18n();
  const { hint } = useSay();

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
      {ROADS.map((r) => {
        const on = r.id === value;
        const p = progress[r.id] ?? 0;
        return (
          <div key={r.id} className={cn('relative rounded-3xl border-2 bg-white p-4 transition sm:p-5', on ? 'border-guide-600' : 'border-line hover:border-ink-soft/40')}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-sign text-2xl leading-tight sm:text-3xl">{i.tx(r.name)}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {i.tx(r.area)}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 font-semibold">
                  {i.tx(r.from)}
                  <ArrowRight className="h-4 w-4 text-ink-soft" />
                  {i.tx(r.to)}
                </p>
              </div>
              <SpeakButton
                className="relative z-10"
                text={{
                  en: `${r.name.en}, ${r.area.en}. From ${r.from.en} to ${r.to.en}. ${i.numEn(r.lengthKm, 1)} kilometres, ${i.numEn(p, 0)} percent done.`,
                  bn: `${r.name.bn}, ${r.area.bn}। ${r.from.bn} থেকে ${r.to.bn}। ${i.fixed(r.lengthKm)} কিলোমিটার, ${i.num(p)} শতাংশ শেষ।`,
                }}
              />
            </div>
            <RoadStrip className="mt-3" progress={p} lengthKm={r.lengthKm} />
            <p className={cn('mt-1 font-semibold', p >= 100 ? 'text-guide-700' : p === 0 ? 'text-ink-soft' : 'text-ink')}>
              {p === 0 ? i.t('Not started yet', 'এখনো শুরু হয়নি') : i.t(`${i.fixed(p)}% done`, `${i.fixed(p)}% শেষ`)}
            </p>
            <button
              type="button"
              onClick={() => {
                hint(r.name);
                onPick(r);
              }}
              className={cn(
                'mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold text-white shadow-[0_3px_0_0_var(--color-guide-800)] transition after:absolute after:inset-0 after:rounded-3xl active:translate-y-[2px] active:shadow-none',
                'bg-guide-600 hover:bg-guide-700',
              )}
            >
              {on && <Check className="h-5 w-5" />}
              {i.t('Work on this road', 'এই রাস্তায় কাজ')}
            </button>
          </div>
        );
      })}
    </div>
  );
}
