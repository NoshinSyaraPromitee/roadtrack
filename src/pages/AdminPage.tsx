import { FileText, Gauge, HandCoins, Megaphone, Tractor, Wallet } from 'lucide-react';
import { ComplaintsInbox, useComplaints } from '@/features/complaints';
import { ProgressChart, ProjectOverview, ShiftRecords, WastageChart } from '@/features/dashboard';
import { EquipmentBoard, useEquipment } from '@/features/equipment';
import { useRoad } from '@/features/road';
import { PayrollApprovals } from '@/features/payroll';
import { RaiseInbox, useRaiseRequests } from '@/features/raise-requests';
import { useCompletedShifts, useShiftStore } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { PageHeader, TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const TAB_KEYS = ['overview', 'pay', 'machines', 'complaints', 'raises', 'records'] as const;
type Tab = (typeof TAB_KEYS)[number];

export function AdminPage() {
  const i = useI18n();
  const shifts = useCompletedShifts();
  const approve = useShiftStore((s) => s.approvePayroll);
  const openComplaints = useComplaints((s) => s.complaints.filter((c) => c.status !== 'resolved').length);
  const openRaises = useRaiseRequests((s) => s.requests.filter((r) => r.status === 'pending').length);
  const pendingPay = shifts.filter((s) => s.payrollStatus === 'pending').length;
  const road = useRoad();
  const broken = useEquipment((s) => s.machines.filter((m) => m.roadId === road.id && m.status === 'repair').length);
  const [tab, setTab] = useUrlState<Tab>('tab', 'overview', TAB_KEYS);

  const tabs: TabItem<Tab>[] = [
    { key: 'overview', icon: Gauge, label: { en: 'Overview', bn: 'সারসংক্ষেপ' } },
    { key: 'pay', icon: Wallet, label: { en: 'Pay', bn: 'মজুরি' }, count: pendingPay },
    { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' }, count: broken },
    { key: 'complaints', icon: Megaphone, label: { en: 'Complaints', bn: 'অভিযোগ' }, count: openComplaints },
    { key: 'raises', icon: HandCoins, label: { en: 'Raises', bn: 'বেতন বৃদ্ধি' }, count: openRaises },
    { key: 'records', icon: FileText, label: { en: 'Records', bn: 'রেকর্ড' } },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={i.t('Head office', 'প্রধান কার্যালয়')}
        subtitle={i.t(`${road.name.en}, ${road.area.en}`, `${road.name.bn}, ${road.area.bn}`)}
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
      {tab === 'machines' && <EquipmentBoard />}
      {tab === 'complaints' && <ComplaintsInbox />}
      {tab === 'raises' && <RaiseInbox />}
      {tab === 'records' && <ShiftRecords />}
    </div>
  );
}
