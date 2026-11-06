import { Bandage, CircleCheck, LogOut, Thermometer, ThumbsUp, Users } from 'lucide-react';
import type { Attendance, Health } from '@/core/types';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { Badge, Card, CardHeader, Segmented, Stepper } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

const PRESENCE: SegmentOption<boolean>[] = [
  { value: true, icon: CircleCheck, label: { en: 'Here', bn: 'আছেন' }, tone: 'green' },
  { value: false, icon: LogOut, label: { en: 'Left', bn: 'চলে গেছেন' }, tone: 'red' },
];

const HEALTH: SegmentOption<Health>[] = [
  { value: 'fit', icon: ThumbsUp, label: { en: 'Well', bn: 'ভালো' }, tone: 'green' },
  { value: 'sick', icon: Thermometer, label: { en: 'Sick', bn: 'অসুস্থ' }, tone: 'yellow' },
  { value: 'injured', icon: Bandage, label: { en: 'Hurt', bn: 'আহত' }, tone: 'red' },
];

export function CountStep({ rows, updateRow }: { rows: Attendance[]; updateRow: (id: string, patch: Partial<Attendance>) => void }) {
  const i = useI18n();
  const { t, tx, num } = i;
  const workers = useWorkforce((s) => s.workers);
  const here = rows.filter((r) => r.presentAtEnd).length;
  return (
    <Card>
      <CardHeader
        icon={Users}
        title={t('Who is still here?', 'কে কে এখনো আছেন?')}
        subtitle={t(`${num(here)} of ${num(rows.length)} here`, `${num(rows.length)} জনের মধ্যে ${num(here)} জন আছেন`)}
        speak={{ en: 'Who is still here? Mark anyone who left, and anyone sick or hurt.', bn: 'কে কে এখনো আছেন? কেউ চলে গেলে, অসুস্থ বা আহত হলে চিহ্ন দিন।' }}
        action={
          here < rows.length ? (
            <Badge tone="red" icon={LogOut}>
              {t(`${num(rows.length - here)} left`, `${num(rows.length - here)} জন চলে গেছেন`)}
            </Badge>
          ) : (
            <Badge tone="green" icon={CircleCheck}>
              {t('Everyone is here', 'সবাই আছেন')}
            </Badge>
          )
        }
      />
      <ul className="space-y-3">
        {rows.map((r) => {
          const w = workers.find((x) => x.id === r.workerId);
          if (!w) return null;
          return (
            <li key={r.workerId} className={cn('rounded-2xl border-2 p-3 transition sm:p-4', r.presentAtEnd ? 'border-line' : 'border-stop-100 bg-stop-50/60')}>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
                <div className="flex items-center gap-3">
                  <Avatar person={w} size={56} dim={!r.presentAtEnd} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold leading-tight">{personName(w, i.lang)}</p>
                    <p className="truncate text-sm text-ink-soft">{tx(roleOf(w))}</p>
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-line p-2">
                  <p className="mb-1.5 px-1 text-sm font-semibold text-ink-soft">{t('On site', 'সাইটে')}</p>
                  <Segmented boxed label={t('On site', 'সাইটে')} options={PRESENCE} value={r.presentAtEnd} onChange={(v) => updateRow(r.workerId, { presentAtEnd: v })} />
                </div>
                <div className="rounded-2xl border-2 border-line p-2">
                  <p className="mb-1.5 px-1 text-sm font-semibold text-ink-soft">{t('Health', 'স্বাস্থ্য')}</p>
                  <Segmented boxed label={t('Health', 'স্বাস্থ্য')} options={HEALTH} value={r.health} onChange={(v) => updateRow(r.workerId, { health: v })} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-sm leading-tight text-ink-soft">{t('Work done', 'কাজ')}</span>
                  <div className="flex-1">
                    <Stepper value={r.output} step={5} unit={t('m', 'মি.')} label={t('Metres done', 'কত মিটার')} onChange={(v) => updateRow(r.workerId, { output: v })} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
