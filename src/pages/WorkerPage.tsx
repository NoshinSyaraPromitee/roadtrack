import { Navigate } from 'react-router-dom';
import { ComplaintForm, MyComplaints } from '@/features/complaints';
import { WorkerEarnings } from '@/features/payroll';
import { MyRaiseRequests, RaiseRequestForm } from '@/features/raise-requests';
import { useSession } from '@/features/session';
import { useCompletedShifts } from '@/features/shift';
import { useWorker } from '@/features/workforce';
import { PageHeader } from '@/shared/ui';

export function WorkerPage() {
  const workerId = useSession((s) => s.workerId);
  const worker = useWorker(workerId);
  const shifts = useCompletedShifts();

  if (!worker) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={`${worker.post} | ${worker.phone}`}
        title={`Hi, ${worker.name.split(' ')[0]}`}
        subtitle="Your earnings, complaints and raise requests in one place."
      />
      <WorkerEarnings shifts={shifts} worker={worker} />
      <RaiseRequestForm worker={worker} />
      <MyRaiseRequests workerId={worker.id} />
      <ComplaintForm workerId={worker.id} />
      <MyComplaints workerId={worker.id} />
    </div>
  );
}