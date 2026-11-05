import { CalendarCheck, Clock3, HeartHandshake, Wallet } from 'lucide-react';
import type { Shift, Worker } from '@/core/types';
import { Badge, Card, CardHeader, EmptyState, StatCard } from '@/shared/ui';
import { fmtDate, sum, taka } from '@/shared/lib/utils';

export function WorkerEarnings({ shifts, worker }: { shifts: Shift[]; worker: Worker }) {
  const entries = shifts
    .filter((s) => s.status === 'completed')
    .flatMap((s) => {
      const line = s.payroll.find((l) => l.workerId === worker.id);
      return line ? [{ shift: s, line }] : [];
    })
    .reverse();

  const approved = entries.filter((e) => e.shift.payrollStatus === 'approved');
  const pending = entries.filter((e) => e.shift.payrollStatus === 'pending');
  const daysWorked = entries.filter((e) => e.line.total > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard accent icon={Wallet} label="Total earned" value={taka(sum(approved.map((e) => e.line.total)))} hint="Approved by authority" />
        <StatCard icon={Clock3} label="Pending" value={taka(sum(pending.map((e) => e.line.total)))} hint="Awaiting approval" />
        <StatCard icon={CalendarCheck} label="Days worked" value={daysWorked} hint={`of ${entries.length} shifts`} />
        <StatCard icon={HeartHandshake} label="Welfare credit" value={taka(sum(entries.map((e) => e.line.welfareBonus)))} hint="Senior / health support" />
      </div>

      <Card>
        <CardHeader icon={CalendarCheck} title="Daily pay history" subtitle={`Current daily rate: ${taka(worker.dailyRate)}`} />
        {entries.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No shifts yet" text="Your pay appears here after the supervisor closes a shift." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {entries.map(({ shift, line }) => (
              <li key={shift.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">{fmtDate(shift.startedAt)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {line.notes.length === 0 ? (
                      <span className="text-xs text-zinc-500">Full day</span>
                    ) : (
                      line.notes.map((n) => (
                        <Badge key={n} tone={n === 'Absent' || n.startsWith('Missing') ? 'red' : 'blue'}>
                          {n}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold tabular-nums">{taka(line.total)}</p>
                  <Badge tone={shift.payrollStatus === 'approved' ? 'green' : 'amber'}>{shift.payrollStatus === 'approved' ? 'Paid' : 'Pending'}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}