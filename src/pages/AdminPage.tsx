import { FileText, Gauge, HandCoins, Megaphone, Route, Tractor, UserPlus, Wallet } from 'lucide-react';
import { isBroken } from '@/core/machines';
import { sumMaterials } from '@/core/materials';
import { ComplaintsInbox, useComplaints } from '@/features/complaints';
import { ProgressChart, ProjectOverview, ShiftRecords } from '@/features/dashboard';
import { EquipmentBoard, useEquipment } from '@/features/equipment';
import { AddRoadForm, RoadList, useRoad } from '@/features/road';
import { PayrollApprovals } from '@/features/payroll';
import { RaiseInbox, useRaiseRequests } from '@/features/raise-requests';
import { ContractorApprovals, usePendingRegistrations } from '@/features/session';
import { MaterialTotals, useCompletedShifts, useRoadProgressMap, useShiftStore } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { PageHeader, TabBar } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const TAB_KEYS = ['overview', 'pay', 'machines', 'complaints', 'raises', 'records', 'roads', 'contractors'] as const;
type Tab = (typeof TAB_KEYS)[number];

export function AdminPage() {
  const i = useI18n();
  const shifts = useCompletedShifts();
  const approve = useShiftStore((s) => s.approvePayroll);
  const openComplaints = useComplaints((s) => s.complaints.filter((c) => c.status !== 'resolved').length);
  const openRaises = useRaiseRequests((s) => s.requests.filter((r) => r.status === 'pending').length);
  const pendingPay = shifts.filter((s) => s.payrollStatus === 'pending').length;
  const road = useRoad();
  const broken = useEquipment((s) => s.machines.filter((m) => m.roadId === road.id && isBroken(m)).length);
  const [tab, setTab] = useUrlState<Tab>('tab', 'overview', TAB_KEYS);
  const progressMap = useRoadProgressMap();
  const pendingContractors = usePendingRegistrations();
  const toOverview = () => {
    setTab('overview');
    window.scrollTo({ top: 0 });
  };

  const tabs: TabItem<Tab>[] = [
    { key: 'overview', icon: Gauge, label: { en: 'Overview', bn: 'সারসংক্ষেপ' } },
    { key: 'pay', icon: Wallet, label: { en: 'Pay', bn: 'মজুরি' }, count: pendingPay },
    { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' }, count: broken },
    { key: 'complaints', icon: Megaphone, label: { en: 'Complaints', bn: 'অভিযোগ' }, count: openComplaints },
    { key: 'raises', icon: HandCoins, label: { en: 'Raises', bn: 'বেতন বৃদ্ধি' }, count: openRaises },
    { key: 'records', icon: FileText, label: { en: 'Records', bn: 'রেকর্ড' } },
    { key: 'roads', icon: Route, label: { en: 'Roads', bn: 'রাস্তা' } },
    { key: 'contractors', icon: UserPlus, label: { en: 'Contractors', bn: 'ঠিকাদার' }, count: pendingContractors },
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
          <MaterialTotals lines={sumMaterials(shifts.map((s) => s.materials))} title={i.t('Materials on this road, all shifts', 'এই রাস্তার সব শিফটের মালামাল')} filterable />
          <ProgressChart />
        </>
      )}
      {tab === 'pay' && <PayrollApprovals shifts={shifts} onApprove={approve} />}
      {tab === 'machines' && <EquipmentBoard />}
      {tab === 'complaints' && <ComplaintsInbox />}
      {tab === 'raises' && <RaiseInbox />}
      {tab === 'records' && <ShiftRecords />}
      {tab === 'contractors' && <ContractorApprovals />}
      {tab === 'roads' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <AddRoadForm onAdded={toOverview} />
          <RoadList progress={progressMap} onOpen={toOverview} />
        </div>
      )}
    </div>
  );
}
