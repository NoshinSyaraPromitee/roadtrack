import { Navigate } from 'react-router-dom';
import { HeartPulse, Megaphone, TrendingUp, Wallet } from 'lucide-react';
import { ComplaintWizard, MyComplaints } from '@/features/complaints';
import { HealthCheckIn, MyHealthHistory } from '@/features/health';
import { WorkerEarnings } from '@/features/payroll';
import { MyRaiseRequests, RaiseRequestForm } from '@/features/raise-requests';
import { useSession } from '@/features/session';
import { useAllCompletedShifts } from '@/features/shift';
import { useWorker } from '@/features/workforce';
import { TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const TAB_KEYS = ['money', 'health', 'raise', 'complain'] as const;
type Tab = (typeof TAB_KEYS)[number];

const TABS: TabItem<Tab>[] = [
  { key: 'money', icon: Wallet, label: { en: 'My money', bn: 'আমার টাকা' } },
  { key: 'health', icon: HeartPulse, label: { en: 'My health', bn: 'আমার স্বাস্থ্য' } },
  { key: 'raise', icon: TrendingUp, label: { en: 'More pay', bn: 'বেতন বাড়ান' } },
  { key: 'complain', icon: Megaphone, label: { en: 'Complain', bn: 'অভিযোগ' } },
];

export function WorkerPage() {
  const workerId = useSession((s) => s.workerId);
  const worker = useWorker(workerId);
  const shifts = useAllCompletedShifts();
  const [tab, setTab] = useUrlState<Tab>('tab', 'money', TAB_KEYS);

  if (!worker) return <Navigate to="/" replace />;

  const go = (k: Tab) => {
    setTab(k);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto max-w-md pb-28 lg:max-w-none lg:pb-4">
      <div className="mb-5 hidden lg:block">
        <TabBar items={TABS} value={tab} onChange={go} />
      </div>

      {tab === 'money' && <WorkerEarnings shifts={shifts} worker={worker} />}
      {tab === 'health' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <HealthCheckIn key={worker.id} worker={worker} />
          <MyHealthHistory workerId={worker.id} />
        </div>
      )}
      {tab === 'raise' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <RaiseRequestForm key={worker.dailyRate} worker={worker} />
          <MyRaiseRequests workerId={worker.id} />
        </div>
      )}
      {tab === 'complain' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <ComplaintWizard workerId={worker.id} />
          <MyComplaints workerId={worker.id} />
        </div>
      )}

      <div className="lg:hidden">
        <TabBar variant="bottom" items={TABS} value={tab} onChange={go} />
      </div>
    </div>
  );
}
