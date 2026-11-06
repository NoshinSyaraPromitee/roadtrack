import { MapPin, Play, Users } from 'lucide-react';
import { MATERIAL_BY_KEY } from '@/core/catalog';
import { pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { AvatarStack, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Card, CardHeader, RoadStrip } from '@/shared/ui';
import type { DayPlan } from '../model/daySetup';
import { useShiftStore } from '../model/store';
import { MaterialPicto } from './icons';

/** The last step of the supervisor's day: check the plan once more and start the work. */
export function StartWork({ plan, onBack, onStarted }: { plan: DayPlan; onBack: () => void; onStarted: () => void }) {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const road = useRoad();
  const workers = useWorkforce((s) => s.workers);
  const startShift = useShiftStore((s) => s.startShift);
  const crew = workers.filter((w) => plan.workerIds.includes(w.id));

  const start = () => {
    startShift({ roadId: road.id, ...plan });
    onStarted();
  };

  return (
    <div className="space-y-5 pb-36">
      <Card>
        <CardHeader
          title={t('Everything is ready. Start the work?', 'সব ঠিক আছে। কাজ শুরু করবেন?')}
          speak={{
            en: `${crew.length} workers at ${plan.site.en}. Tap Start work.`,
            bn: `${plan.site.bn}-এ ${num(crew.length)} জন শ্রমিক। "কাজ শুরু করুন" চাপুন।`,
          }}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Users className="h-5 w-5 text-ink-soft" />
            <AvatarStack people={crew} size={40} />
            <span className="font-semibold">{t(`${num(crew.length)} workers`, `${num(crew.length)} জন শ্রমিক`)}</span>
          </div>
          <p className="flex items-center gap-3 text-lg">
            <MapPin className="h-5 w-5 shrink-0 text-ink-soft" />
            {tx(plan.site)}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {plan.materials.map((m) => (
              <span key={m.key} className="inline-flex items-center gap-2">
                <MaterialPicto k={m.key} size={32} />
                <span className="font-sign text-xl tabular-nums">{num(m.allocated)}</span>
                <span className="text-sm text-ink-soft">{tx(MATERIAL_BY_KEY[m.key].unit)}</span>
              </span>
            ))}
          </div>
          <div>
            <p className="mb-2 text-ink-soft">
              {t(`${fixed(pctToKm(plan.startProgress, road), 2)} km of ${fixed(road.lengthKm)} km done`, `${fixed(road.lengthKm)} কিমির মধ্যে ${fixed(pctToKm(plan.startProgress, road), 2)} কিমি হয়েছে`)}
            </p>
            <RoadStrip progress={plan.startProgress} lengthKm={road.lengthKm} />
          </div>
        </div>
      </Card>
      <ActionBar onBack={onBack} onNext={start} nextIcon={Play} nextLabel={t('Start work', 'কাজ শুরু করুন')} />
    </div>
  );
}
