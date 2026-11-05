import { useMemo } from 'react';
import { EyeOff, Inbox, Megaphone, UserRound } from 'lucide-react';
import type { Complaint, ComplaintStatus, Person } from '@/core/types';
import { COMPLAINT_CATEGORIES } from '@/core/catalog';
import { SUPERVISOR } from '@/core/seed';
import { Avatar, personName, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { VoiceNote } from '@/shared/voice';
import { Badge, Card, CardHeader, EmptyState, Pictogram, Segmented } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { CATEGORY_ICON, STATUS_META } from './meta';
import { useComplaints } from './store';

function useFindPerson() {
  const workers = useWorkforce((s) => s.workers);
  return (id: string): Person | undefined => (id === SUPERVISOR.id ? SUPERVISOR : workers.find((w) => w.id === id));
}

function Against({ id, size = 36 }: { id: string; size?: number }) {
  const i = useI18n();
  const find = useFindPerson();
  const p = find(id);
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {p ? <Avatar person={p} size={size} /> : <Pictogram icon={UserRound} tone="muted" shape="disc" size={size} />}
      <span className="truncate font-semibold">{p ? personName(p, i.lang) : i.t('Someone else', 'অন্য কেউ')}</span>
    </span>
  );
}

function Body({ c }: { c: Complaint }) {
  return (
    <div className="mt-3 space-y-2">
      {c.audio && <VoiceNote src={c.audio} />}
      {c.message && <p className="text-ink">{c.message}</p>}
    </div>
  );
}

export function MyComplaints({ workerId }: { workerId: string }) {
  const i = useI18n();
  const all = useComplaints((s) => s.complaints);
  const mine = useMemo(() => all.filter((c) => c.fromWorkerId === workerId).reverse(), [all, workerId]);

  return (
    <Card>
      <CardHeader icon={Inbox} title={i.t('My complaints', 'আমার অভিযোগ')} subtitle={i.t('See what the office is doing', 'অফিস কী করছে দেখুন')} />
      {mine.length === 0 ? (
        <EmptyState icon={Inbox} title={i.t('No complaints yet', 'এখনো কোনো অভিযোগ নেই')} />
      ) : (
        <ul className="space-y-3">
          {mine.map((c) => {
            const st = STATUS_META[c.status];
            return (
              <li key={c.id} className="rounded-2xl border border-line p-3">
                <div className="flex items-center gap-3">
                  <Pictogram icon={CATEGORY_ICON[c.category]} shape="warn" tone="stop" size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{i.tx(COMPLAINT_CATEGORIES[c.category])}</p>
                    <p className="text-sm text-ink-soft">{i.date(c.createdAt)}</p>
                  </div>
                  <Badge tone={st.tone} icon={st.icon}>
                    {i.tx(st.label)}
                  </Badge>
                </div>
                <div className="mt-3">
                  <Against id={c.againstId} size={32} />
                </div>
                <Body c={c} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

const STATUS_OPTIONS: SegmentOption<ComplaintStatus>[] = (['open', 'reviewing', 'resolved'] as ComplaintStatus[]).map((s) => ({
  value: s,
  icon: STATUS_META[s].icon,
  label: STATUS_META[s].label,
  tone: STATUS_META[s].tone === 'yellow' ? 'yellow' : STATUS_META[s].tone === 'blue' ? 'blue' : 'green',
}));

export function ComplaintsInbox() {
  const i = useI18n();
  const complaints = useComplaints((s) => s.complaints);
  const setStatus = useComplaints((s) => s.setStatus);
  const find = useFindPerson();
  const sorted = useMemo(() => [...complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [complaints]);
  const unresolved = complaints.filter((c) => c.status !== 'resolved').length;

  return (
    <Card>
      <CardHeader
        icon={Megaphone}
        tone="stop"
        shape="warn"
        title={i.t('Worker complaints', 'শ্রমিকদের অভিযোগ')}
        subtitle={i.t('Sent from workers’ phones, by voice or text.', 'শ্রমিকদের ফোন থেকে, কণ্ঠে বা লিখে পাঠানো।')}
        action={
          <Badge tone={unresolved ? 'red' : 'green'} icon={Megaphone}>
            {i.t(`${i.num(unresolved)} not solved`, `${i.num(unresolved)}টি সমাধান হয়নি`)}
          </Badge>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState icon={Inbox} title={i.t('No complaints', 'কোনো অভিযোগ নেই')} />
      ) : (
        <ul className="space-y-3">
          {sorted.map((c) => {
            const from = find(c.fromWorkerId);
            return (
              <li key={c.id} className="rounded-2xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Pictogram icon={CATEGORY_ICON[c.category]} shape="warn" tone="stop" size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{i.tx(COMPLAINT_CATEGORIES[c.category])}</p>
                    <p className="text-sm text-ink-soft">{i.dateLong(c.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-stop-50 p-2.5">
                    <p className="mb-1 text-sm text-stop-700">{i.t('About', 'যার বিষয়ে')}</p>
                    <Against id={c.againstId} />
                  </div>
                  <div className="rounded-xl bg-paper p-2.5">
                    <p className="mb-1 text-sm text-ink-soft">{i.t('From', 'যিনি পাঠিয়েছেন')}</p>
                    {c.anonymous || !from ? (
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <Pictogram icon={EyeOff} tone="muted" shape="disc" size={36} />
                        {i.t('Name hidden', 'নাম গোপন')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <Avatar person={from} size={36} />
                        {personName(from, i.lang)}
                      </span>
                    )}
                  </div>
                </div>
                <Body c={c} />
                <div className="mt-3">
                  <Segmented size="sm" label={i.t('Status', 'অবস্থা')} options={STATUS_OPTIONS} value={c.status} onChange={(v) => setStatus(c.id, v)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}