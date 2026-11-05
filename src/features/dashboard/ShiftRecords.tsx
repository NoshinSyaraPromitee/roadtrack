import { Fragment, useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { payrollTotal } from '@/core/payroll';
import { useCompletedShifts } from '@/features/shift';
import { Badge, Button, Card, CardHeader } from '@/shared/ui';
import { cn, fmtDate, fmtTime, pct, sum, taka } from '@/shared/lib/utils';

export function ShiftRecords() {
  const shifts = useCompletedShifts();
  const rows = [...shifts].reverse();
  const [open, setOpen] = useState<string | null>(null);

  const exportCsv = () => {
    const header = ['Date', 'Location', 'Clock in', 'Clock out', 'Clocked in', 'At recount', 'Start %', 'End %', 'Breaks', 'Payroll BDT', 'Payroll status', 'Incidents'];
    const body = rows.map((s) => [
      fmtDate(s.startedAt),
      s.site,
      fmtTime(s.startedAt),
      s.endedAt ? fmtTime(s.endedAt) : '',
      s.attendance.filter((a) => a.presentAtStart).length,
      s.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length,
      s.startProgress,
      s.endProgress ?? '',
      s.breaks.length,
      payrollTotal(s.payroll),
      s.payrollStatus ?? '',
      s.incidents,
    ]);
    const csv = [header, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadtrack-shift-records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader
        icon={FileText}
        title="Project records"
        subtitle="Every shift as recorded by the supervisor. Click a row for details."
        action={
          <Button size="sm" variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-2 pr-3 font-semibold">Date</th>
              <th className="py-2 pr-3 font-semibold">Location</th>
              <th className="py-2 pr-3 font-semibold">Crew</th>
              <th className="py-2 pr-3 font-semibold">Progress</th>
              <th className="py-2 pr-3 font-semibold">Wastage</th>
              <th className="py-2 pr-3 font-semibold">Payroll</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((s) => {
              const isOpen = open === s.id;
              const present = s.attendance.filter((a) => a.presentAtStart).length;
              const recount = s.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length;
              const waste = sum(s.materials.map((m) => pct(m.wasted, m.used + m.wasted))) / (s.materials.length || 1);
              const gained = (s.endProgress ?? s.startProgress) - s.startProgress;
              return (
                <Fragment key={s.id}>
                  <tr className="cursor-pointer hover:bg-zinc-50" onClick={() => setOpen(isOpen ? null : s.id)}>
                    <td className="py-3 pr-3 font-semibold">{fmtDate(s.startedAt)}</td>
                    <td className="py-3 pr-3 text-zinc-600">{s.site}</td>
                    <td className="py-3 pr-3 tabular-nums">
                      {present}/{s.attendance.length}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">
                      {s.endProgress}% <span className="text-xs text-emerald-600">+{gained.toFixed(1)}</span>
                    </td>
                    <td className={cn('py-3 pr-3 tabular-nums', waste > 5 ? 'font-semibold text-red-600' : 'text-zinc-600')}>{waste.toFixed(1)}%</td>
                    <td className="py-3 pr-3 font-semibold tabular-nums">{taka(payrollTotal(s.payroll))}</td>
                    <td className="py-3 pr-3">
                      <Badge tone={s.payrollStatus === 'approved' ? 'green' : 'amber'}>{s.payrollStatus === 'approved' ? 'Paid' : 'Pending'}</Badge>
                    </td>
                    <td className="py-3">
                      <ChevronDown className={cn('h-4 w-4 text-zinc-400 transition', isOpen && 'rotate-180')} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={8} className="bg-zinc-50 px-4 py-4">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Materials</p>
                            <ul className="space-y-1">
                              {s.materials.map((m) => (
                                <li key={m.name} className="flex justify-between gap-2">
                                  <span>{m.name}</span>
                                  <span className="tabular-nums text-zinc-600">
                                    {m.used} used | <span className={cn(m.wasted > 0 && 'text-red-600')}>{m.wasted} wasted</span> {m.unit}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Shift log</p>
                            <ul className="space-y-1 text-zinc-600">
                              <li>
                                Clocked in {fmtTime(s.startedAt)}, out {s.endedAt ? fmtTime(s.endedAt) : '-'}
                              </li>
                              <li>
                                {s.breaks.length} breaks ({s.breaks.filter((b) => b.type === 'snack').length} with snacks)
                              </li>
                              <li>
                                Recount: {recount} of {present} present
                              </li>
                              <li>Supervisor: {s.supervisor}</li>
                            </ul>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Incidents</p>
                            <p className="text-zinc-600">{s.incidents || 'No incidents reported.'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}