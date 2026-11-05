import { CircleCheck, Clock, Construction, Send, TriangleAlert, Users, Wallet } from 'lucide-react';
import { INCIDENTS, MATERIAL_BY_KEY } from '@/core/catalog';
import { payrollTotal } from '@/core/payroll';
import { PROJECT } from '@/core/seed';
import { PayrollList } from '@/features/payroll';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, PageHeader, RoadStrip, StackBar, StatCard } from '@/shared/ui';
import { useShiftById } from '../model/selectors';
import { INCIDENT_ICON, MaterialPicto } from './icons';

export function ShiftSummary({ shiftId, onClose }: { shiftId: string; onClose: () => void }) {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const shift = useShiftById(shiftId);
  if (!shift || !shift.endedAt) return null;

  const started = shift.attendance.filter((a) => a.presentAtStart).length;
  const stayed = shift.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length;
  const end = shift.endProgress ?? shift.startProgress;
  const total = payrollTotal(shift.payroll);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('Shift finished', 'শিফট শেষ')}
        subtitle={`${i.dateLong(shift.startedAt)}, ${shift.site}`}
        speak={{ en: `Shift finished. The pay list of ${i.numEn(total)} taka was sent to the office.`, bn: `শিফট শেষ। ${num(total)} টাকার মজুরির তালিকা অফিসে পাঠানো হয়েছে।` }}
        action={
          <Button size="lg" onClick={onClose}>
            <CircleCheck />
            {t('Done', 'ঠিক আছে')}
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl bg-guide-600 p-4 text-white">
        <Send className="mt-0.5 h-6 w-6 shrink-0" />
        <p className="text-lg">
          <b>{t('Pay list sent to the office.', 'মজুরির তালিকা অফিসে পাঠানো হয়েছে।')}</b>{' '}
          {t('Workers see it as waiting until the office approves it.', 'অফিস অনুমোদন না করা পর্যন্ত শ্রমিকরা এটি অপেক্ষায় দেখবেন।')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label={t('Shift time', 'শিফটের সময়')} value={i.dur(new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime())} hint={`${i.time(shift.startedAt)} – ${i.time(shift.endedAt)}`} />
        <StatCard icon={Users} label={t('Stayed till the end', 'শেষ পর্যন্ত ছিলেন')} value={`${num(stayed)}/${num(started)}`} />
        <StatCard icon={Construction} tone="mark" label={t('Road done today', 'আজকের কাজ')} value={`+${fixed(end - shift.startProgress)}%`} hint={t(`Now ${fixed(end)}%`, `এখন ${fixed(end)}%`)} />
        <StatCard icon={Wallet} label={t('Pay list', 'মজুরি')} value={i.taka(total)} />
      </div>

      <Card>
        <RoadStrip progress={end} lengthKm={PROJECT.lengthKm} today={{ from: shift.startProgress, to: end }} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader icon={TriangleAlert} shape="warn" tone="stop" title={t('Materials and problems', 'মালামাল ও সমস্যা')} />
          <ul className="space-y-3">
            {shift.materials.map((m) => {
              const def = MATERIAL_BY_KEY[m.key];
              return (
                <li key={m.key} className="flex items-center gap-3">
                  <MaterialPicto k={m.key} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-semibold">{tx(def.name)}</span>
                      <span className="tabular-nums text-ink-soft">
                        {num(m.used)} <span className="text-stop-600">+{num(m.wasted)}</span> / {num(m.allocated)} {tx(def.unit)}
                      </span>
                    </div>
                    <StackBar
                      className="mt-1.5"
                      total={m.allocated}
                      parts={[
                        { value: m.used, className: 'bg-guide-500' },
                        { value: m.wasted, className: 'bg-stop-500' },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {shift.incidentTags.length === 0 ? (
              <Badge tone="green" icon={CircleCheck}>
                {t('No problems', 'কোনো সমস্যা নেই')}
              </Badge>
            ) : (
              shift.incidentTags.map((k) => (
                <Badge key={k} tone="red" icon={INCIDENT_ICON[k]}>
                  {tx(INCIDENTS[k])}
                </Badge>
              ))
            )}
          </div>
          {shift.incidents && <p className="mt-3 rounded-xl bg-paper p-3 text-ink-soft">{shift.incidents}</p>}
        </Card>
        <Card>
          <CardHeader icon={Wallet} title={t('Pay list', 'মজুরির তালিকা')} action={<Badge tone="yellow">{t('Waiting for office', 'অফিসের অপেক্ষায়')}</Badge>} />
          <PayrollList lines={shift.payroll} />
        </Card>
      </div>
    </div>
  );
}