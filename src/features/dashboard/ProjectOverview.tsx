import { Activity, Trash2, Users, Wallet } from 'lucide-react';
import { PAYROLL_RULES, payrollTotal } from '@/core/payroll';
import { RoadHero, useRoad } from '@/features/road';
import { useActiveShift, useCompletedShifts, useProjectProgress } from '@/features/shift';
import { useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { StatCard } from '@/shared/ui';
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

  return (
    <div className="space-y-4">
      <RoadHero road={road} progress={progress} showName />
      <p className="-mt-1 text-ink-soft">{t(`Worked out from ${num(completed.length)} recorded shifts.`, `${num(completed.length)}টি শিফটের হিসাব থেকে।`)}</p>

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
