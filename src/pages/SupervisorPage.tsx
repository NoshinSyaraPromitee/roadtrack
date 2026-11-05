import { useState } from 'react';
import { PROJECT } from '@/core/seed';
import { BreakReminder } from '@/features/reminders';
import { ActiveShiftPanel, EndShiftForm, ShiftSummary, StartShiftForm, useActiveShift, useShiftStore } from '@/features/shift';
import { PageHeader } from '@/shared/ui';

export function SupervisorPage() {
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [summaryId, setSummaryId] = useState<string | null>(null);

  if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setSummaryId(null)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={PROJECT.supervisor}
        title={active ? 'Shift control' : "Start today's shift"}
        subtitle={active ? 'Keep the crew rested, then recount and close the shift.' : 'Enter the crew, their posts, materials and progress so far.'}
      />
      {active ? (
        <>
          <ActiveShiftPanel shift={active} />
          <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={logBreak} />
          <EndShiftForm key={active.id} shift={active} onEnded={setSummaryId} />
        </>
      ) : (
        <StartShiftForm />
      )}
    </div>
  );
}