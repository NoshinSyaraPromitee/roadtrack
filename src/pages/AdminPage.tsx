import { ComplaintsInbox } from '@/features/complaints';
import { ProgressChart, ProjectOverview, ShiftRecords, WastageChart } from '@/features/dashboard';
import { PayrollApprovals } from '@/features/payroll';
import { RaiseInbox } from '@/features/raise-requests';
import { useCompletedShifts, useShiftStore } from '@/features/shift';
import { PageHeader } from '@/shared/ui';

export function AdminPage() {
  const shifts = useCompletedShifts();
  const approve = useShiftStore((s) => s.approvePayroll);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Higher Authority" title="Project dashboard" subtitle="Progress, payroll, complaints and the full recorded history." />
      <ProjectOverview />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart />
        <WastageChart />
      </div>
      <PayrollApprovals shifts={shifts} onApprove={approve} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ComplaintsInbox />
        <RaiseInbox />
      </div>
      <ShiftRecords />
    </div>
  );
}