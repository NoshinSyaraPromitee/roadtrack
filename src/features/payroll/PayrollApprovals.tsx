import { useState } from 'react';
import { BadgeCheck, ChevronDown, Wallet } from 'lucide-react';
import type { Shift } from '@/core/types';
import { payrollTotal } from '@/core/payroll';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/shared/ui';
import { cn, fmtDate, taka } from '@/shared/lib/utils';
import { PayrollTable } from './PayrollTable';

export function PayrollApprovals({ shifts, onApprove }: { shifts: Shift[]; onApprove: (id: string) => void }) {
  const pending = shifts.filter((s) => s.status === 'completed' && s.payrollStatus === 'pending');
  const [open, setOpen] = useState<string | null>(pending[0]?.id ?? null);

  return (
    <Card>
      <CardHeader
        icon={Wallet}
        title="Payroll approvals"
        subtitle="Lists sent by the supervisor at the end of each shift"
        action={<Badge tone={pending.length ? 'amber' : 'green'}>{pending.length} pending</Badge>}
      />
      {pending.length === 0 ? (
        <EmptyState icon={BadgeCheck} title="All payrolls approved" text="New lists appear here when a supervisor closes a shift." />
      ) : (
        <ul className="space-y-3">
          {pending.map((s) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id} className="rounded-xl border border-zinc-200">
                <button type="button" onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {fmtDate(s.startedAt)} | {s.site}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {s.payroll.filter((l) => l.total > 0).length} workers to be paid | sent by {s.supervisor}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold tabular-nums">{taka(payrollTotal(s.payroll))}</span>
                    <ChevronDown className={cn('h-4 w-4 transition', isOpen && 'rotate-180')} />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-100 p-4">
                    <PayrollTable lines={s.payroll} />
                    <div className="mt-4 flex justify-end">
                      <Button variant="success" onClick={() => onApprove(s.id)}>
                        <BadgeCheck className="h-4 w-4" /> Approve & release payment
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}