import { Camera, CircleCheck, Clock, Construction, Send, TriangleAlert, Users, Wallet } from 'lucide-react';
import { payrollTotal } from '@/core/payroll';
import { pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { PayrollList } from '@/features/payroll';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, PageHeader, PhotoStrip, RoadStrip, StatCard } from '@/shared/ui';
import { useShiftById } from '../model/selectors';
import { MaterialTotals } from './MaterialTotals';
import { IncidentBadges, MaterialUseList } from './ShiftParts';

export function ShiftSummary({ shiftId, onClose }: { shiftId: string; onClose: () => void }) {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const shift = useShiftById(shiftId);
  const road = useRoad();
  if (!shift || !shift.endedAt) return null;

  const started = shift.attendance.filter((a) => a.presentAtStart).length;
  const stayed = shift.attendance.filter((a) => a.presentAtStart && a.presentAtEnd).length;
  const end = shift.endProgress ?? shift.startProgress;
  const total = payrollTotal(shift.payroll);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('Shift finished', 'শিফট শেষ')}
        speak={{ en: `Shift finished. The pay list of ${i.numEn(total)} taka was sent to the office.`, bn: `শিফট শেষ। ${num(total)} টাকার মজুরির তালিকা অফিসে পাঠানো হয়েছে।` }}
        action={
          <div className="flex flex-col items-end gap-3 text-right">
            <p className="font-semibold text-ink-soft sm:text-lg">{`${i.dateLong(shift.startedAt)}, ${tx(shift.site)}`}</p>
            <Button size="lg" onClick={onClose}>
              <CircleCheck />
              {t('Done', 'ঠিক আছে')}
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl bg-guide-600 p-4 text-white">
        <Send className="mt-0.5 h-6 w-6 shrink-0" />
        <p className="text-lg">
          <b>{t('Pay list sent to the office.', 'মজুরির তালিকা অফিসে পাঠানো হয়েছে।')}</b>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label={t('Shift time', 'শিফটের সময়')} value={i.dur(new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime())} hint={`${i.time(shift.startedAt)} - ${i.time(shift.endedAt)}`} />
        <StatCard icon={Users} label={t('Stayed till the end', 'শেষ পর্যন্ত ছিলেন')} value={`${num(stayed)}/${num(started)}`} />
        <StatCard icon={Construction} tone="mark" label={t('Road done today', 'আজকের কাজ')} value={`+${fixed(pctToKm(end, road) - pctToKm(shift.startProgress, road), 2)} ${t('km', 'কিমি')}`} hint={t(`Now ${fixed(end)}% of the road`, `এখন রাস্তার ${fixed(end)}%`)} />
        <StatCard icon={Wallet} label={t('Pay list', 'মজুরি')} value={i.taka(total)} />
      </div>

      <Card>
        <RoadStrip progress={end} lengthKm={road.lengthKm} today={{ from: shift.startProgress, to: end }} />
      </Card>

      <MaterialTotals lines={shift.materials} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader icon={TriangleAlert} shape="warn" tone="stop" title={t('Materials and problems', 'মালামাল ও সমস্যা')} />
          <MaterialUseList lines={shift.materials} />
          <div className="mt-4 flex flex-wrap gap-2">
            <IncidentBadges tags={shift.incidentTags} none={{ en: 'No problems', bn: 'কোনো সমস্যা নেই' }} />
          </div>
          {shift.incidents && <p className="mt-3 rounded-xl bg-paper p-3 text-ink-soft">{shift.incidents}</p>}
        </Card>
        {!!shift.photos?.length && (
          <Card>
            <CardHeader icon={Camera} tone="sign" shape="disc" title={t('Photos of the work', 'কাজের ছবি')} />
            <PhotoStrip photos={shift.photos} />
          </Card>
        )}
        <Card>
          <CardHeader icon={Wallet} title={t('Pay list', 'মজুরির তালিকা')} action={<Badge tone="yellow">{t('Waiting for office', 'অফিসের অপেক্ষায়')}</Badge>} />
          <PayrollList lines={shift.payroll} />
        </Card>
      </div>
    </div>
  );
}
