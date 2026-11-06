import { useState } from 'react';
import { ChevronDown, CircleCheck, Download, FileText, Hourglass } from 'lucide-react';
import { INCIDENTS } from '@/core/catalog';
import { payrollTotal } from '@/core/payroll';
import { pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { IncidentBadges, MaterialUseList, useCompletedShifts } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, DateTile, PhotoStrip } from '@/shared/ui';
import { cn, pct, sum } from '@/shared/lib/utils';
import { BreakBadges } from '@/features/reminders';

export function ShiftRecords() {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const road = useRoad();
  const rows = [...useCompletedShifts()].reverse();
  const [open, setOpen] = useState<string | null>(null);

  const exportCsv = () => {
    const header = ['Date', 'Site', 'Clock in', 'Clock out', 'Clocked in', 'At recount', 'Start %', 'End %', 'Start km', 'End km', 'Rest breaks', 'Snack breaks', 'Wastage %', 'Payroll BDT', 'Payroll status', 'Problems', 'Notes', 'Photos'];
    const body = rows.map((s) => [
      new Date(s.startedAt).toLocaleDateString('en-GB'),
      s.site.en,
      new Date(s.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      s.endedAt ? new Date(s.endedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
      s.attendance.filter((a) => a.presentAtStart).length,
      s.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length,
      s.startProgress,
      s.endProgress ?? '',
      pctToKm(s.startProgress, road),
      s.endProgress !== undefined ? pctToKm(s.endProgress, road) : '',
      s.breaks.filter((b) => b.type === 'rest').length,
      s.breaks.filter((b) => b.type === 'snack').length,
      (sum(s.materials.map((m) => pct(m.wasted, m.used + m.wasted))) / (s.materials.length || 1)).toFixed(1),
      payrollTotal(s.payroll),
      s.payrollStatus ?? '',
      s.incidentTags.map((k) => INCIDENTS[k].en).join('; '),
      s.incidents,
      s.photos?.length ?? 0,
    ]);
    const csv = [header, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadtrack-${road.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader
        icon={FileText}
        tone="plain"
        title={t('Every shift on record', 'সব শিফটের রেকর্ড')}
        action={
          <Button variant="secondary" onClick={exportCsv}>
            <Download />
            {t('Download CSV', 'CSV ডাউনলোড')}
          </Button>
        }
      />
      <ul className="space-y-2">
        {rows.map((s) => {
          const isOpen = open === s.id;
          const present = s.attendance.filter((a) => a.presentAtStart).length;
          const stayed = s.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length;
          const waste = sum(s.materials.map((m) => pct(m.wasted, m.used + m.wasted))) / (s.materials.length || 1);
          const gained = (s.endProgress ?? s.startProgress) - s.startProgress;
          const paid = s.payrollStatus === 'approved';
          return (
            <li key={s.id} className="overflow-hidden rounded-2xl border border-line">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left hover:bg-guide-50 sm:gap-4 sm:p-4"
              >
                <DateTile at={s.startedAt} />
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-ink-soft">{tx(s.site)}</span>
                  <span>
                    {t('Workers', 'শ্রমিক')} {num(stayed)}/{num(present)}
                  </span>
                  <span className="font-semibold text-guide-700">+{fixed(gained)}%</span>
                  <span className={cn(waste > 5 ? 'font-semibold text-stop-600' : 'text-ink-soft')}>
                    {t('Waste', 'নষ্ট')} {fixed(waste)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-sign text-xl tabular-nums">{i.taka(payrollTotal(s.payroll))}</p>
                    <Badge tone={paid ? 'green' : 'yellow'} icon={paid ? CircleCheck : Hourglass}>
                      {paid ? t('Paid', 'পরিশোধিত') : t('Waiting', 'অপেক্ষায়')}
                    </Badge>
                  </div>
                  <ChevronDown className={cn('h-5 w-5 text-ink-soft transition', isOpen && 'rotate-180')} />
                </div>
              </button>
              {isOpen && (
                <div className="grid gap-5 bg-paper/50 p-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 font-semibold">{t('Materials', 'মালামাল')}</p>
                    <MaterialUseList lines={s.materials} compact />
                  </div>
                  <div>
                    <p className="mb-2 font-semibold">{t('Shift log', 'শিফটের হিসাব')}</p>
                    <ul className="space-y-1.5 text-ink-soft">
                      <li>
                        {t('From', 'সময়')} {i.time(s.startedAt)} {t('to', 'থেকে')} {s.endedAt ? i.time(s.endedAt) : '-'}
                      </li>
                      <li className="flex flex-wrap gap-1.5">
                        <BreakBadges breaks={s.breaks} />
                      </li>
                      <li>{t(`${num(stayed)} of ${num(present)} stayed till the end`, `${num(present)} জনের মধ্যে ${num(stayed)} জন শেষ পর্যন্ত ছিলেন`)}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 font-semibold">{t('Problems', 'সমস্যা')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <IncidentBadges tags={s.incidentTags} none={{ en: 'None', bn: 'নেই' }} />
                    </div>
                    {s.incidents && <p className="mt-2 text-ink-soft">{s.incidents}</p>}
                  </div>
                  {!!s.photos?.length && (
                    <div className="md:col-span-3">
                      <p className="mb-2 font-semibold">{t('Photos of the work', 'কাজের ছবি')}</p>
                      <PhotoStrip photos={s.photos} size="sm" />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
