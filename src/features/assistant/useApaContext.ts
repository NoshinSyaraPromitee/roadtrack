import { useComplaintReceipts, useComplaints } from '@/features/complaints';
import { useEquipment } from '@/features/equipment';
import { useHealthReports } from '@/features/health';
import { useRaiseRequests } from '@/features/raise-requests';
import { useRoad } from '@/features/road';
import { useSession } from '@/features/session';
import { useShiftStore } from '@/features/shift';
import { useWorker, useWorkforce } from '@/features/workforce';
import type { ApaContext } from './brain';

export function useApaContext() {
  const role = useSession((s) => s.role);
  const workerId = useSession((s) => s.workerId);
  const worker = useWorker(workerId);
  const workers = useWorkforce((s) => s.workers);
  const shifts = useShiftStore((s) => s.shifts);
  const raises = useRaiseRequests((s) => s.requests);
  const complaints = useComplaints((s) => s.complaints);
  const receipts = useComplaintReceipts((s) => s.byWorker);
  const road = useRoad();
  const machines = useEquipment((s) => s.machines);
  const health = useHealthReports((s) => s.reports);
  const context = (): ApaContext => ({ role: role ?? 'worker', road, worker: role === 'worker' ? worker : undefined, workers, shifts, machines, health, raises, complaints, ownComplaintIds: workerId ? receipts[workerId] : undefined });
  return { role, road, shifts, context };
}
