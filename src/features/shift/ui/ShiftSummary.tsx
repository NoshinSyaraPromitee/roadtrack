import { ArrowLeft, Clock, Package, Send, TrendingUp, Users, Wallet } from 'lucide-react';
import { payrollTotal } from '@/core/payroll';
import { PayrollTable } from '@/features/payroll';
import { Badge, Button, Card, CardHeader, PageHeader, StatCard } from '@/shared/ui';
import { cn, fmtDate, fmtDuration, fmtTime, taka } from '@/shared/lib/utils';
import { useShiftById } from '../model/selectors';

export function ShiftSummary({ shiftId, onClose }: { shiftId: string; onClose: () => void }) {
  const shift = useShiftById(shiftId);
  if (!shift || !shift.endedAt) return null;

  const duration = new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime();
  const started = shift.attendance.filter((a) => a.presentAtStart).length;
  const recount = shift.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length;
  const gained = (shift.endProgress ?? shift.startProgress) - shift.startProgress;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Shift closed | ${fmtDate(shift.startedAt)}`}
        title="End-of-shift report"
        subtitle={shift.site}
        action={
          <Button variant="secondary" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <Send className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <span className="font-semibold">Payroll sent to the higher authority.</span> Workers see it as pending on their phones until it is approved.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard accent icon={Clock} label="Shift length" value={fmtDuration(duration)} hint={`${fmtTime(shift.startedAt)} - ${fmtTime(shift.endedAt)}`} />
        <StatCard icon={Users} label="Recount" value={`${recount}/${started}`} hint="At end / clocked in" />
        <StatCard icon={TrendingUp} label="Progress" value={`+${gained.toFixed(1)}%`} hint={`Road now at ${shift.endProgress}%`} />
        <StatCard icon={Wallet} label="Payroll" value={taka(payrollTotal(shift.payroll))} hint={`${shift.payroll.filter((l) => l.total > 0).length} workers`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.7fr]">
        <Card>
          <CardHeader icon={Package} title="Materials" subtitle="Used and wasted today" />
          <ul className="divide-y divide-zinc-100 text-sm">
            {shift.materials.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-2 py-2.5">
                <span className="font-semibold">{m.name}</span>
                <span className="tabular-nums text-zinc-600">
                  {m.used} used | <span className={cn(m.wasted > 0 && 'font-semibold text-red-600')}>{m.wasted} wasted</span> {m.unit}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Incidents</p>
            <p className="mt-1 text-zinc-700">{shift.incidents || 'No incidents reported.'}</p>
          </div>
        </Card>
        <Card>
          <CardHeader icon={Wallet} title="Payroll list" action={<Badge tone="amber">Pending approval</Badge>} />
          <PayrollTable lines={shift.payroll} />
        </Card>
      </div>
    </div>
  );
}