import { Activity, AlertTriangle, Users, Wallet } from 'lucide-react';
import { PROJECT } from '@/core/seed';
import { PAYROLL_RULES, payrollTotal } from '@/core/payroll';
import { useActiveShift, useCompletedShifts, useProjectProgress } from '@/features/shift';
import { useWorkforce } from '@/features/workforce';
import { Card, ProgressBar, StatCard } from '@/shared/ui';
import { fmtTime, pct, sum, taka } from '@/shared/lib/utils';

export function ProjectOverview() {
  const progress = useProjectProgress();
  const active = useActiveShift();
  const completed = useCompletedShifts();
  const workers = useWorkforce((s) => s.workers);

  const lines = completed.flatMap((s) => s.materials);
  const wastePct = lines.length ? sum(lines.map((m) => pct(m.wasted, m.used + m.wasted))) / lines.length : 0;
  const pendingPay = sum(completed.filter((s) => s.payrollStatus === 'pending').map((s) => payrollTotal(s.payroll)));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">{PROJECT.section}</p>
            <h2 className="mt-1 text-xl font-extrabold">{PROJECT.name}</h2>
          </div>
          <p className="text-3xl font-extrabold tabular-nums">{progress.toFixed(1)}%</p>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {((PROJECT.lengthKm * progress) / 100).toFixed(2)} km of {PROJECT.lengthKm} km completed across {completed.length} recorded shifts
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          accent
          icon={Activity}
          label="Live shift"
          value={active ? `${active.attendance.length} on site` : 'Idle'}
          hint={active ? `Since ${fmtTime(active.startedAt)} | ${active.breaks.length} breaks` : 'No shift running'}
        />
        <StatCard icon={Users} label="Workforce" value={workers.length} hint={`${workers.filter((w) => w.age >= PAYROLL_RULES.seniorAge).length} senior workers`} />
        <StatCard icon={AlertTriangle} label="Avg. wastage" value={`${wastePct.toFixed(1)}%`} hint="Of materials consumed" />
        <StatCard icon={Wallet} label="Pending payroll" value={taka(pendingPay)} hint="Awaiting your approval" />
      </div>
    </div>
  );
}