import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Megaphone, TrendingUp, Wallet } from 'lucide-react';
import { ComplaintWizard, MyComplaints } from '@/features/complaints';
import { WorkerEarnings } from '@/features/payroll';
import { MyRaiseRequests, RaiseRequestForm } from '@/features/raise-requests';
import { useSession } from '@/features/session';
import { useCompletedShifts } from '@/features/shift';
import { useWorker } from '@/features/workforce';
import { TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';

type Tab = 'money' | 'raise' | 'complain';

const TABS: TabItem<Tab>[] = [
  { key: 'money', icon: Wallet, label: { en: 'My money', bn: 'আমার টাকা' } },
  { key: 'raise', icon: TrendingUp, label: { en: 'More pay', bn: 'বেতন বাড়ান' } },
  { key: 'complain', icon: Megaphone, label: { en: 'Complain', bn: 'অভিযোগ' } },
];

export function WorkerPage() {
  const workerId = useSession((s) => s.workerId);
  const worker = useWorker(workerId);
  const shifts = useCompletedShifts();
  const [tab, setTab] = useState<Tab>('money');

  if (!worker) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md space-y-4 pb-28">
      {tab === 'money' && <WorkerEarnings shifts={shifts} worker={worker} />}
      {tab === 'raise' && (
        <>
          <RaiseRequestForm key={worker.dailyRate} worker={worker} />
          <MyRaiseRequests workerId={worker.id} />
        </>
      )}
      {tab === 'complain' && (
        <>
          <ComplaintWizard workerId={worker.id} />
          <MyComplaints workerId={worker.id} />
        </>
      )}
      <TabBar variant="bottom" items={TABS} value={tab} onChange={(k) => {
        setTab(k);
        window.scrollTo({ top: 0 });
      }} />
    </div>
  );
}