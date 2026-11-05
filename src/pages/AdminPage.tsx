import { useState } from 'react';
import { FileText, Gauge, HandCoins, Megaphone, Wallet } from 'lucide-react';
import { ComplaintsInbox, useComplaints } from '@/features/complaints';
import { ProgressChart, ProjectOverview, ShiftRecords, WastageChart } from '@/features/dashboard';
import { PayrollApprovals } from '@/features/payroll';
import { RaiseInbox, useRaiseRequests } from '@/features/raise-requests';
import { useCompletedShifts, useShiftStore } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { PageHeader, TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';

type Tab = 'overview' | 'pay' | 'complaints' | 'raises' | 'records';

export function AdminPage() {
  const i = useI18n();
  const shifts = useCompletedShifts();
  const approve = useShiftStore((s) => s.approvePayroll);
  const openComplaints = useComplaints((s) => s.complaints.filter((c) => c.status !== 'resolved').length);
  const openRaises = useRaiseRequests((s) => s.requests.filter((r) => r.status === 'pending').length);
  const pendingPay = shifts.filter((s) => s.payrollStatus === 'pending').length;
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: TabItem<Tab>[] = [
    { key: 'overview', icon: Gauge, label: { en: 'Overview', bn: 'সারসংক্ষেপ' } },
    { key: 'pay', icon: Wallet, label: { en: 'Pay', bn: 'মজুরি' }, count: pendingPay },
    { key: 'complaints', icon: Megaphone, label: { en: 'Complaints', bn: 'অভিযোগ' }, count: openComplaints },
    { key: 'raises', icon: HandCoins, label: { en: 'Raises', bn: 'বেতন বৃদ্ধি' }, count: openRaises },
    { key: 'records', icon: FileText, label: { en: 'Records', bn: 'রেকর্ড' } },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={i.t('Head office', 'প্রধান কার্যালয়')}
        subtitle={i.t('Approve pay, answer workers and follow the road.', 'মজুরি অনুমোদন, শ্রমিকদের জবাব আর রাস্তার অগ্রগতি।')}
      />
      <TabBar items={tabs} value={tab} onChange={setTab} />
      {tab === 'overview' && (
        <>
          <ProjectOverview />
          <div className="grid gap-5 lg:grid-cols-2">
            <ProgressChart />
            <WastageChart />
          </div>
        </>
      )}
      {tab === 'pay' && <PayrollApprovals shifts={shifts} onApprove={approve} />}
      {tab === 'complaints' && <ComplaintsInbox />}
      {tab === 'raises' && <RaiseInbox />}
      {tab === 'records' && <ShiftRecords />}
    </div>
  );
}