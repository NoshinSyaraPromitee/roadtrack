import type { PayrollLine } from '@/core/types';
import { payrollTotal } from '@/core/payroll';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { PayFlags } from './PayFlags';

export function PayrollList({ lines }: { lines: PayrollLine[] }) {
  const i = useI18n();
  const workers = useWorkforce((s) => s.workers);

  return (
    <div>
      <ul className="divide-y divide-line">
        {lines.map((l) => {
          const w = workers.find((x) => x.id === l.workerId);
          if (!w) return null;
          return (
            <li key={l.workerId} className={cn('grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3', l.total === 0 && 'opacity-60')}>
              <Avatar person={w} size={48} dim={l.total === 0} />
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">{personName(w, i.lang)}</p>
                <p className="mb-1.5 truncate text-sm text-ink-soft">{i.tx(roleOf(w))}</p>
                <PayFlags flags={l.flags} />
              </div>
              <div className="text-right">
                <p className="font-sign text-2xl tabular-nums">{i.taka(l.total)}</p>
                {(l.deduction > 0 || l.welfareBonus > 0) && (
                  <p className="text-sm tabular-nums text-ink-soft">
                    {i.taka(l.basePay)}
                    {l.deduction > 0 && <span className="ml-1 text-stop-600">−{i.taka(l.deduction)}</span>}
                    {l.welfareBonus > 0 && <span className="ml-1 text-guide-700">+{i.taka(l.welfareBonus)}</span>}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
        <span className="font-semibold">{i.t('Total to pay', 'মোট দিতে হবে')}</span>
        <span className="font-sign text-3xl tabular-nums">{i.taka(payrollTotal(lines))}</span>
      </div>
    </div>
  );
}