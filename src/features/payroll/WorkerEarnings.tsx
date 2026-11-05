import { CalendarCheck, CircleCheck, HandCoins, HeartHandshake, Hourglass } from 'lucide-react';
import type { Shift, Worker } from '@/core/types';
import { Face, shortName } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Badge, Card, CardHeader, EmptyState, Pictogram } from '@/shared/ui';
import { cn, sum } from '@/shared/lib/utils';
import { PayFlags } from './PayFlags';

export function WorkerEarnings({ shifts, worker }: { shifts: Shift[]; worker: Worker }) {
  const i = useI18n();
  const entries = shifts
    .filter((s) => s.status === 'completed')
    .flatMap((s) => {
      const line = s.payroll.find((l) => l.workerId === worker.id);
      return line ? [{ shift: s, line }] : [];
    })
    .reverse();

  const paid = sum(entries.filter((e) => e.shift.payrollStatus === 'approved').map((e) => e.line.total));
  const waiting = sum(entries.filter((e) => e.shift.payrollStatus === 'pending').map((e) => e.line.total));
  const days = entries.filter((e) => e.line.total > 0).length;
  const extra = sum(entries.map((e) => e.line.welfareBonus));

  const summary = {
    en: `${worker.name}. You have been paid ${i.numEn(paid)} taka. ${i.numEn(waiting)} taka is waiting for the office. You worked ${days} days. Your daily pay is ${i.numEn(worker.dailyRate)} taka.`,
    bn: `${worker.nameBn}। আপনি ${i.num(paid)} টাকা পেয়েছেন। ${i.num(waiting)} টাকা অফিসের অনুমোদনের অপেক্ষায়। আপনি ${i.num(days)} দিন কাজ করেছেন। আপনার দৈনিক মজুরি ${i.num(worker.dailyRate)} টাকা।`,
  };

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-guide-600 p-5 text-white">
        <div className="pointer-events-none absolute inset-2 rounded-[20px] border-2 border-white/80" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <Face look={worker.look} size={56} className="rounded-full ring-2 ring-white" />
            <div className="min-w-0 flex-1">
              <p className="text-white/80">{i.t('Your money', 'আপনার টাকা')}</p>
              <p className="truncate font-sign text-2xl leading-tight">{shortName(worker, i.lang)}</p>
            </div>
            <SpeakButton text={summary} tone="dark" size="lg" />
          </div>
          <p className="mt-5 text-white/85">{i.t('Paid to you', 'আপনি পেয়েছেন')}</p>
          <p className="font-sign text-6xl leading-none tabular-nums">{i.taka(paid)}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5">
            <HandCoins className="h-5 w-5" />
            {i.t(`Daily pay ${i.taka(worker.dailyRate)}`, `দৈনিক মজুরি ${i.taka(worker.dailyRate)}`)}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Hourglass, tone: 'mark' as const, label: i.t('Waiting', 'অপেক্ষায়'), value: i.taka(waiting) },
          { icon: CalendarCheck, tone: 'guide' as const, label: i.t('Days worked', 'কাজের দিন'), value: i.num(days) },
          { icon: HeartHandshake, tone: 'sign' as const, label: i.t('Extra help', 'বাড়তি সহায়তা'), value: i.taka(extra) },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-2 py-3 text-center">
            <Pictogram icon={s.icon} tone={s.tone} size={40} />
            <p className="font-sign text-2xl leading-none tabular-nums">{s.value}</p>
            <p className="text-sm leading-tight text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader icon={CalendarCheck} title={i.t('Day by day', 'দিন অনুযায়ী')} subtitle={i.t('Newest first', 'নতুন আগে')} />
        {entries.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={i.t('No pay yet', 'এখনো কোনো মজুরি নেই')} text={i.t('Your pay shows here after the supervisor ends a shift.', 'সুপারভাইজার শিফট শেষ করলে মজুরি এখানে দেখাবে।')} />
        ) : (
          <ul className="divide-y divide-line">
            {entries.map(({ shift, line }) => {
              const isPaid = shift.payrollStatus === 'approved';
              return (
                <li key={shift.id} className="flex items-center gap-3 py-3">
                  <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-paper py-1.5 text-center leading-none">
                    <span className="text-xs text-ink-soft">{i.weekday(shift.startedAt)}</span>
                    <span className="font-sign text-2xl">{i.day(shift.startedAt)}</span>
                    <span className="text-xs text-ink-soft">{i.month(shift.startedAt)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <PayFlags flags={line.flags} />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('font-sign text-2xl tabular-nums', line.total === 0 && 'text-ink-soft')}>{i.taka(line.total)}</p>
                    <Badge tone={isPaid ? 'green' : 'yellow'} icon={isPaid ? CircleCheck : Hourglass}>
                      {isPaid ? i.t('Paid', 'পেয়েছেন') : i.t('Waiting', 'অপেক্ষায়')}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}