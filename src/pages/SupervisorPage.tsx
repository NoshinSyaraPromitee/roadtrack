import { useState } from 'react';
import { HardHat, HeartPulse, Tractor } from 'lucide-react';
import { EquipmentBoard } from '@/features/equipment';
import { CrewHealth } from '@/features/health';
import { BreakReminder } from '@/features/reminders';
import { useRoad } from '@/features/road';
import { ActiveShiftPanel, EndShiftWizard, ShiftSummary, StartShiftWizard, useActiveShift, useShiftStore } from '@/features/shift';
import { TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';

type Tab = 'work' | 'machines' | 'health';

const TABS: TabItem<Tab>[] = [
  { key: 'work', icon: HardHat, label: { en: "Today's work", bn: 'আজকের কাজ' } },
  { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' } },
  { key: 'health', icon: HeartPulse, label: { en: 'Crew health', bn: 'শ্রমিকদের শরীর' } },
];

export function SupervisorPage() {
  const road = useRoad();
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [tab, setTab] = useState<Tab>('work');
  const [ending, setEnding] = useState(false);
  const [summaryId, setSummaryId] = useState<string | null>(null);

  const work = () => {
    if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setSummaryId(null)} />;
    if (!active) return <StartShiftWizard key={road.id} />;
    if (ending) {
      return (
        <EndShiftWizard
          key={active.id}
          shift={active}
          onCancel={() => setEnding(false)}
          onEnded={(id) => {
            setEnding(false);
            setSummaryId(id);
          }}
        />
      );
    }
    return (
      <div className="space-y-5">
        <ActiveShiftPanel shift={active} onFinish={() => setEnding(true)} />
        <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={(type) => logBreak(road.id, type)} />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {!ending && <TabBar items={TABS} value={tab} onChange={setTab} />}
      {(tab === 'work' || ending) && work()}
      {tab === 'machines' && !ending && <EquipmentBoard />}
      {tab === 'health' && !ending && <CrewHealth />}
    </div>
  );
}
