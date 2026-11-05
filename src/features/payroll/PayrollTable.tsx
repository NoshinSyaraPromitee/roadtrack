import type { PayrollLine } from '@/core/types';
import { payrollTotal } from '@/core/payroll';
import { Badge } from '@/shared/ui';
import { cn, taka } from '@/shared/lib/utils';

export function PayrollTable({ lines }: { lines: PayrollLine[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="py-2 pr-3 font-semibold">Worker</th>
            <th className="py-2 pr-3 font-semibold">Base</th>
            <th className="py-2 pr-3 font-semibold">Deduction</th>
            <th className="py-2 pr-3 font-semibold">Welfare credit</th>
            <th className="py-2 pr-3 font-semibold">Payable</th>
            <th className="py-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {lines.map((l) => (
            <tr key={l.workerId} className={cn(l.total === 0 && 'text-zinc-400')}>
              <td className="py-2.5 pr-3">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-zinc-500">{l.post}</p>
              </td>
              <td className="py-2.5 pr-3 tabular-nums">{taka(l.basePay)}</td>
              <td className="py-2.5 pr-3 tabular-nums text-red-600">{l.deduction ? `-${taka(l.deduction)}` : '-'}</td>
              <td className="py-2.5 pr-3 tabular-nums text-emerald-700">{l.welfareBonus ? `+${taka(l.welfareBonus)}` : '-'}</td>
              <td className="py-2.5 pr-3 font-bold tabular-nums">{taka(l.total)}</td>
              <td className="py-2.5">
                <div className="flex flex-wrap gap-1">
                  {l.notes.length === 0 && <span className="text-xs text-zinc-400">Full day</span>}
                  {l.notes.map((n) => (
                    <Badge key={n} tone={n === 'Absent' || n.startsWith('Missing') ? 'red' : 'blue'}>
                      {n}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-zinc-200">
            <td colSpan={4} className="py-3 pr-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total payable
            </td>
            <td className="py-3 text-base font-extrabold tabular-nums">{taka(payrollTotal(lines))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}