import { Activity, Trash2, Users, Wallet } from 'lucide-react';
import { PAYROLL_RULES, payrollTotal } from '@/core/payroll';
import { useRoad } from '@/features/road';
import { useActiveShift, useCompletedShifts, useProjectProgress } from '@/features/shift';
import { useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { RoadStrip, StatCard } from '@/shared/ui';
import { pct, sum } from '@/shared/lib/utils';

export function ProjectOverview() {
  const i = useI18n();
  const { t, num, fixed } = i;
  const road = useRoad();
  const progress = useProjectProgress();
  const active = useActiveShift();
  const completed = useCompletedShifts();
  const workers = useWorkforce((s) => s.workers);

  const lines = completed.flatMap((s) => s.materials);
  const wastePct = lines.length ? sum(lines.map((m) => pct(m.wasted, m.used + m.wasted))) / lines.length : 0;
  const pendingPay = sum(completed.filter((s) => s.payrollStatus === 'pending').map((s) => payrollTotal(s.payroll)));
  const doneKm = (road.lengthKm * progress) / 100;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-line bg-white p-4 sm:p-6">
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-guide-600 px-5 py-4 text-white">
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-sign text-3xl leading-tight sm:text-4xl">{i.tx(road.name)}</p>
              <p className="text-white/85">{i.t(`${road.from.en} to ${road.to.en}, ${road.area.en}`, `${road.from.bn} থেকে ${road.to.bn}, ${road.area.bn}`)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-sign text-5xl leading-none tabular-nums">{fixed(progress)}%</p>
              <SpeakButton
                tone="dark"
                text={{
                  en: `${i.numEn(doneKm, 2)} of ${i.numEn(road.lengthKm, 1)} kilometres are done. That is ${i.numEn(progress, 1)} percent.`,
                  bn: `${fixed(road.lengthKm)} কিলোমিটারের মধ্যে ${fixed(doneKm, 2)} কিলোমিটার শেষ। মানে ${fixed(progress)} শতাংশ।`,
                }}
              />
            </div>
          </div>
        </div>
        <RoadStrip progress={progress} lengthKm={road.lengthKm} size="lg" />
        <p className="mt-3 text-ink-soft">
          {t(
            `${fixed(doneKm, 2)} km paved out of ${fixed(road.lengthKm)} km, over ${num(completed.length)} recorded shifts.`,
            `${fixed(road.lengthKm)} কিমির মধ্যে ${fixed(doneKm, 2)} কিমি পাকা হয়েছে, ${num(completed.length)}টি শিফটে।`,
          )}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          tone={active ? 'mark' : 'muted'}
          label={t('Right now', 'এই মুহূর্তে')}
          value={active ? t(`${num(active.attendance.length)} working`, `${num(active.attendance.length)} জন কাজে`) : t('No shift', 'শিফট নেই')}
          hint={active ? t(`Since ${i.time(active.startedAt)}, ${num(active.breaks.length)} breaks`, `${i.time(active.startedAt)} থেকে, ${num(active.breaks.length)}টি বিরতি`) : undefined}
        />
        <StatCard
          icon={Users}
          label={t('Workers', 'শ্রমিক')}
          value={num(workers.length)}
          hint={t(`${num(workers.filter((w) => w.age >= PAYROLL_RULES.seniorAge).length)} elders`, `${num(workers.filter((w) => w.age >= PAYROLL_RULES.seniorAge).length)} জন বয়স্ক`)}
        />
        <StatCard icon={Trash2} tone="stop" shape="warn" label={t('Material wasted', 'মাল নষ্ট')} value={`${fixed(wastePct)}%`} hint={t('Average per shift', 'শিফট প্রতি গড়')} />
        <StatCard icon={Wallet} tone="mark" label={t('Pay to approve', 'অনুমোদনের অপেক্ষায়')} value={i.taka(pendingPay)} />
      </div>
    </div>
  );
}
