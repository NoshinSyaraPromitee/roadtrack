import { Clock, Flag, MapPin, Users } from 'lucide-react';
import type { Shift, Worker } from '@/core/types';
import { MATERIAL_BY_KEY } from '@/core/catalog';
import { AvatarStack, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Button, Card } from '@/shared/ui';
import { useNow } from '@/shared/lib/useNow';
import { MaterialPicto } from './icons';

export function ActiveShiftPanel({ shift, onFinish }: { shift: Shift; onFinish: () => void }) {
  const i = useI18n();
  const workers = useWorkforce((s) => s.workers);
  const now = useNow();
  const crew = shift.attendance.map((a) => workers.find((w) => w.id === a.workerId)).filter((w): w is Worker => !!w);

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-guide-600 p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute inset-2 rounded-[20px] border-2 border-white/80" />
        <div className="relative grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mark-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-mark-400" />
              </span>
              <p className="text-xl font-semibold">{i.t('Work is going on', 'কাজ চলছে')}</p>
              <SpeakButton
                tone="dark"
                size="sm"
                text={{
                  en: `Work is going on since ${i.timeEn(shift.startedAt)}. ${crew.length} workers on site.`,
                  bn: `${i.time(shift.startedAt)} থেকে কাজ চলছে। সাইটে ${i.num(crew.length)} জন শ্রমিক।`,
                }}
              />
            </div>
            <p className="mt-3 font-sign text-6xl leading-none tabular-nums sm:text-7xl">{i.dur(now - new Date(shift.startedAt).getTime())}</p>
            <p className="mt-3 flex items-center gap-2 text-lg text-white/90">
              <MapPin className="h-5 w-5" />
              {shift.site}
            </p>
          </div>
          <div className="space-y-3">
            <AvatarStack people={crew} size={44} />
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-5 w-5" />
                {i.t(`${i.num(crew.length)} on site`, `${i.num(crew.length)} জন সাইটে`)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-5 w-5" />
                {i.t(`Started ${i.time(shift.startedAt)}`, `শুরু ${i.time(shift.startedAt)}`)}
              </span>
            </div>
            <Button variant="mark" size="xl" onClick={onFinish} className="w-full">
              <Flag />
              {i.t('Finish work', 'কাজ শেষ করুন')}
            </Button>
          </div>
        </div>
      </section>

      <Card tone="sunk" className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="font-semibold">{i.t('On site today', 'আজ সাইটে আছে')}</p>
        {shift.materials.map((m) => (
          <span key={m.key} className="inline-flex items-center gap-2">
            <MaterialPicto k={m.key} size={32} />
            <span className="font-sign text-xl tabular-nums">{i.num(m.allocated)}</span>
            <span className="text-sm text-ink-soft">{i.tx(MATERIAL_BY_KEY[m.key].unit)}</span>
          </span>
        ))}
      </Card>
    </div>
  );
}