import { useSearchParams } from 'react-router-dom';
import { HardHat, HeartPulse, Tractor } from 'lucide-react';
import { EquipmentBoard } from '@/features/equipment';
import { CrewHealth } from '@/features/health';
import { BreakReminder } from '@/features/reminders';
import { useRoad } from '@/features/road';
import { ActiveShiftPanel, EndShiftWizard, ShiftSummary, StartShiftWizard, useActiveShift, useShiftStore } from '@/features/shift';
import { TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const TAB_KEYS = ['work', 'machines', 'health'] as const;
type Tab = (typeof TAB_KEYS)[number];

const TABS: TabItem<Tab>[] = [
  { key: 'work', icon: HardHat, label: { en: "Today's work", bn: 'আজকের কাজ' } },
  { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' } },
  { key: 'health', icon: HeartPulse, label: { en: 'Crew health', bn: 'শ্রমিকদের শরীর' } },
];

export function SupervisorPage() {
  const road = useRoad();
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [tab, setTab] = useUrlState<Tab>('tab', 'work', TAB_KEYS);
  const [params, setParams] = useSearchParams();
  // "Finish work" and the finished-shift summary are their own screens, so Back leaves them.
  const ending = params.get('view') === 'finish' && !!active;
  const summaryId = params.get('summary');

  const setView = (view: { finish?: boolean; summary?: string }, replace = false) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('view');
        p.delete('summary');
        if (view.finish) p.set('view', 'finish');
        if (view.summary) p.set('summary', view.summary);
        return p;
      },
      { replace },
    );
    window.scrollTo({ top: 0 });
  };

  const work = () => {
    if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setView({}, true)} />;
    if (!active) return <StartShiftWizard key={road.id} />;
    if (ending) {
      return <EndShiftWizard key={active.id} shift={active} onCancel={() => setView({}, true)} onEnded={(id) => setView({ summary: id }, true)} />;
    }
    return (
      <div className="space-y-5">
        <ActiveShiftPanel shift={active} onFinish={() => setView({ finish: true })} />
        <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={(type) => logBreak(road.id, type)} />
      </div>
    );
  };

  const busy = ending || !!summaryId;

  return (
    <div className="space-y-5">
      {!busy && <TabBar items={TABS} value={tab} onChange={setTab} />}
      {(tab === 'work' || busy) && work()}
      {tab === 'machines' && !busy && <EquipmentBoard />}
      {tab === 'health' && !busy && <CrewHealth />}
    </div>
  );
}
