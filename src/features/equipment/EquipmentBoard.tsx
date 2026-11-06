import { CircleCheck, Tractor } from 'lucide-react';
import type { Machine, MachineStatus } from '@/core/types';
import { Avatar, personName, useWorkforce } from '@/features/workforce';
import { useRoad } from '@/features/road';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Button, Card, CardHeader, Pictogram, Segmented, StackBar, Stepper } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { LOW_FUEL_PCT, MACHINE_KIND, MACHINE_STATUS, SERVICE_EVERY_HOURS, fuelLow, machineName, serviceDue } from './meta';
import { useEquipment } from './store';

const STATUS_OPTIONS: SegmentOption<MachineStatus>[] = [
  { value: 'working', icon: MACHINE_STATUS.working.icon, label: MACHINE_STATUS.working.label, tone: 'green' },
  { value: 'idle', icon: MACHINE_STATUS.idle.icon, label: MACHINE_STATUS.idle.label, tone: 'yellow' },
  { value: 'repair', icon: MACHINE_STATUS.repair.icon, label: MACHINE_STATUS.repair.label, tone: 'red' },
];

function MachineCard({ m }: { m: Machine }) {
  const i = useI18n();
  const update = useEquipment((s) => s.update);
  const serviced = useEquipment((s) => s.serviced);
  const workers = useWorkforce((s) => s.workers);
  const operator = workers.find((w) => w.id === m.operatorId);
  const kind = MACHINE_KIND[m.kind];
  const st = MACHINE_STATUS[m.status];
  const low = fuelLow(m);
  const due = serviceDue(m);
  const name = machineName(m);

  return (
    <li className={cn('rounded-2xl border-2 bg-white p-3 sm:p-4', m.status === 'repair' ? 'border-stop-100' : 'border-line')}>
      <div className="flex items-start gap-3">
        <Pictogram icon={kind.icon} tone={m.status === 'repair' ? 'stop' : m.status === 'idle' ? 'mark' : 'guide'} shape={m.status === 'repair' ? 'warn' : 'plate'} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-tight">{i.tx(kind.name)}</p>
          <p className="font-sign text-lg leading-tight text-ink-soft">{m.code}</p>
          <p className={cn('mt-0.5 font-semibold', st.text)}>
            {i.tx(st.label)}
          </p>
        </div>
        <SpeakButton
          size="sm"
          text={{
            en: `${name.en}. ${st.label.en}. Fuel ${m.fuelPct} percent.${low ? ' Fuel is low.' : ''}${due ? ' Service is due.' : ''}`,
            bn: `${name.bn}। ${st.label.bn}। জ্বালানি ${i.num(m.fuelPct)} শতাংশ।${low ? ' জ্বালানি কম।' : ''}${due ? ' সার্ভিসিং দরকার।' : ''}`,
          }}
        />
      </div>

      {operator && (
        <p className="mt-2 flex items-center gap-2 text-ink-soft">
          <Avatar person={operator} size={28} />
          {i.t('Driver', 'চালক')}: <span className="font-semibold text-ink">{personName(operator, i.lang)}</span>
        </p>
      )}

      <div className="mt-3">
        <Segmented label={i.t('Machine state', 'মেশিনের অবস্থা')} options={STATUS_OPTIONS} value={m.status} onChange={(v) => update(m.id, { status: v })} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className={cn('mb-1 text-sm font-semibold', low ? 'text-stop-600' : 'text-ink-soft')}>
            {i.t('Fuel', 'জ্বালানি')}
            {low && ` · ${i.t('low', 'কম')}`}
          </p>
          <StackBar className="mb-2" total={100} parts={[{ value: m.fuelPct, className: low ? 'bg-stop-500' : 'bg-guide-500' }]} />
          <Stepper value={m.fuelPct} step={10} min={0} max={100} unit="%" label={i.t('Fuel', 'জ্বালানি')} onChange={(v) => update(m.id, { fuelPct: v })} />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-ink-soft">
            {i.t('Hours run today', 'আজ কত ঘণ্টা চলেছে')}
          </p>
          <div className="mb-2 h-3" />
          <Stepper value={m.hoursToday} step={0.5} decimals={1} min={0} max={24} unit={i.t('hr', 'ঘণ্টা')} label={i.t('Hours today', 'আজকের ঘণ্টা')} onChange={(v) => update(m.id, { hoursToday: v })} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className={cn('text-sm', due ? 'font-semibold text-stop-600' : 'text-ink-soft')}>
          {due
            ? i.t(`Service due: ${i.num(m.hoursSinceService)} hours since last service`, `সার্ভিসিং দরকার: শেষ সার্ভিসের পর ${i.num(m.hoursSinceService)} ঘণ্টা`)
            : i.t(`Next service in ${i.num(SERVICE_EVERY_HOURS - m.hoursSinceService)} hours`, `${i.num(SERVICE_EVERY_HOURS - m.hoursSinceService)} ঘণ্টা পর সার্ভিসিং`)}
        </span>
        {(due || m.status === 'repair') && (
          <Button variant="secondary" size="sm" onClick={() => serviced(m.id)}>
            <CircleCheck />
            {i.t('Fixed and serviced', 'ঠিক ও সার্ভিস করা হয়েছে')}
          </Button>
        )}
      </div>
    </li>
  );
}

export function EquipmentBoard() {
  const i = useI18n();
  const road = useRoad();
  const all = useEquipment((s) => s.machines);
  const machines = all.filter((m) => m.roadId === road.id);
  const count = (s: MachineStatus) => machines.filter((m) => m.status === s).length;
  const lowFuel = machines.filter(fuelLow);

  return (
    <Card>
      <CardHeader
        icon={Tractor}
        title={i.t('Machines on this road', 'এই রাস্তার মেশিন')}
        subtitle={i.tx(road.name)}
        speak={{
          en: `${count('working')} machines working, ${count('idle')} idle, ${count('repair')} broken.${lowFuel.length ? ` ${lowFuel.length} low on fuel.` : ''}`,
          bn: `${i.num(count('working'))}টি মেশিন চলছে, ${i.num(count('idle'))}টি বসে আছে, ${i.num(count('repair'))}টি নষ্ট।${lowFuel.length ? ` ${i.num(lowFuel.length)}টির জ্বালানি কম।` : ''}`,
        }}
      />
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-lg font-semibold">
        <span className="text-guide-700">{i.t(`${i.num(count('working'))} working`, `${i.num(count('working'))}টি চলছে`)}</span>
        <span className="text-[#9a5b00]">{i.t(`${i.num(count('idle'))} idle`, `${i.num(count('idle'))}টি বসে আছে`)}</span>
        <span className="text-stop-600">{i.t(`${i.num(count('repair'))} broken`, `${i.num(count('repair'))}টি নষ্ট`)}</span>
        {lowFuel.length > 0 && (
          <span className="text-stop-600">{i.t(`${i.num(lowFuel.length)} below ${LOW_FUEL_PCT}% fuel`, `${i.num(lowFuel.length)}টির জ্বালানি ${i.num(LOW_FUEL_PCT)}%-এর কম`)}</span>
        )}
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {machines.map((m) => (
          <MachineCard key={m.id} m={m} />
        ))}
      </ul>
    </Card>
  );
}
