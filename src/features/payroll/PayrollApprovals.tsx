import { useState } from 'react';
import { BadgeCheck, ChevronDown, MapPin, Wallet } from 'lucide-react';
import type { Shift } from '@/core/types';
import { payrollTotal } from '@/core/payroll';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { PayrollList } from './PayrollList';
import { PayRules } from './PayFlags';

export function PayrollApprovals({ shifts, onApprove }: { shifts: Shift[]; onApprove: (id: string) => void }) {
  const i = useI18n();
  const pending = shifts.filter((s) => s.status === 'completed' && s.payrollStatus === 'pending').reverse();
  const [open, setOpen] = useState<string | null>(pending[0]?.id ?? null);

  return (
    <Card>
      <CardHeader
        icon={Wallet}
        title={i.t('Pay lists to approve', 'অনুমোদনের অপেক্ষায় মজুরি')}
        subtitle={i.t('Sent by the supervisor at the end of each shift.', 'প্রতি শিফট শেষে সুপারভাইজার পাঠান।')}
        action={
          <Badge tone={pending.length ? 'yellow' : 'green'} icon={pending.length ? Wallet : BadgeCheck}>
            {i.t(`${i.num(pending.length)} waiting`, `${i.num(pending.length)}টি অপেক্ষায়`)}
          </Badge>
        }
      />
      {pending.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title={i.t('Every pay list is approved', 'সব মজুরি অনুমোদিত')}
          text={i.t('A new list appears here when the supervisor closes a shift.', 'সুপারভাইজার শিফট শেষ করলে নতুন তালিকা এখানে আসবে।')}
        />
      ) : (
        <ul className="space-y-3">
          {pending.map((s) => {
            const isOpen = open === s.id;
            const paid = s.payroll.filter((l) => l.total > 0).length;
            return (
              <li key={s.id} className="overflow-hidden rounded-2xl border border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-paper/60"
                >
                  <div className="min-w-0">
                    <p className="font-sign text-xl">{i.dateLong(s.startedAt)}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {s.site}
                      </span>
                      <span>{i.t(`${i.num(paid)} workers to pay`, `${i.num(paid)} জনকে টাকা দিতে হবে`)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-sign text-2xl tabular-nums">{i.taka(payrollTotal(s.payroll))}</span>
                    <ChevronDown className={cn('h-5 w-5 transition', isOpen && 'rotate-180')} />
                  </div>
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-line p-4">
                    <PayRules />
                    <PayrollList lines={s.payroll} />
                    <div className="flex justify-end">
                      <Button size="lg" onClick={() => onApprove(s.id)}>
                        <BadgeCheck />
                        {i.t('Approve and pay', 'অনুমোদন করে টাকা দিন')}
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