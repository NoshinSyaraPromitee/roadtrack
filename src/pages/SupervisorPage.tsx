import { useSearchParams } from 'react-router-dom';
import { HardHat, HeartPulse, Tractor } from 'lucide-react';
import { SUPERVISOR } from '@/core/seed';
import { ComplaintWizard, MyComplaints } from '@/features/complaints';
import { EquipmentBoard } from '@/features/equipment';
import { CrewHealth } from '@/features/health';
import { BreakReminder } from '@/features/reminders';
import { useRoad } from '@/features/road';
import { ActiveShiftPanel, EndShiftWizard, ShiftSummary, useActiveShift, useShiftStore } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { PageHeader, TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';
import { DaySetupFlow } from './supervisor/DaySetupFlow';

const TAB_KEYS = ['work', 'machines', 'health'] as const;
type Tab = (typeof TAB_KEYS)[number];

const TABS: TabItem<Tab>[] = [
  { key: 'work', icon: HardHat, label: { en: "Today's work", bn: 'আজকের কাজ' } },
  { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' } },
  { key: 'health', icon: HeartPulse, label: { en: 'Crew health', bn: 'শ্রমিকদের স্বাস্থ্য' } },
];

export function SupervisorPage() {
  const i = useI18n();
  const road = useRoad();
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [tab, setTab] = useUrlState<Tab>('tab', 'work', TAB_KEYS);
  const [params, setParams] = useSearchParams();
  const ending = params.get('view') === 'finish' && !!active;
  const complaining = params.get('view') === 'complain';
  const summaryId = params.get('summary');

  const setView = (view: { finish?: boolean; summary?: string }, replace = false) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('view');
        p.delete('summary');
        p.delete('step');
        if (view.finish) p.set('view', 'finish');
        if (view.summary) p.set('summary', view.summary);
        return p;
      },
      { replace },
    );
    window.scrollTo({ top: 0 });
  };

  if (complaining) {
    return (
      <div className="space-y-5">
        <PageHeader title={i.t('Make a complaint', 'অভিযোগ করুন')} speak={{ en: 'Make a complaint. Tap who it is about.', bn: 'অভিযোগ করুন। কার বিষয়ে, তার নামে চাপ দিন।' }} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <ComplaintWizard workerId={SUPERVISOR.id} />
          <MyComplaints workerId={SUPERVISOR.id} />
        </div>
      </div>
    );
  }
  if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setView({}, true)} />;
  if (!active) return <DaySetupFlow key={road.id} />;
  if (ending) {
    return <EndShiftWizard key={active.id} shift={active} onCancel={() => setView({}, true)} onEnded={(id) => setView({ summary: id }, true)} />;
  }

  return (
    <div className="space-y-5">
      <TabBar items={TABS} value={tab} onChange={setTab} />
      {tab === 'work' && (
        <div className="space-y-5">
          <ActiveShiftPanel shift={active} onFinish={() => setView({ finish: true })} />
          <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={(type) => logBreak(road.id, type)} />
        </div>
      )}
      {tab === 'machines' && <EquipmentBoard />}
      {tab === 'health' && <CrewHealth />}
    </div>
  );
}
