import { useState } from 'react';
import { BreakReminder } from '@/features/reminders';
import { ActiveShiftPanel, EndShiftWizard, ShiftSummary, StartShiftWizard, useActiveShift, useShiftStore } from '@/features/shift';

export function SupervisorPage() {
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [ending, setEnding] = useState(false);
  const [summaryId, setSummaryId] = useState<string | null>(null);

  if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setSummaryId(null)} />;
  if (!active) return <StartShiftWizard />;
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
      <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={logBreak} />
    </div>
  );
}