import { useMemo } from 'react';
import { Inbox, MessageSquareWarning } from 'lucide-react';
import type { ComplaintStatus } from '@/core/types';
import { useWorkforce } from '@/features/workforce';
import { Badge, Card, CardHeader, EmptyState } from '@/shared/ui';
import type { Tone } from '@/shared/ui';
import { cn, fmtDate } from '@/shared/lib/utils';
import { useComplaints } from './store';

const STATUS_TONE: Record<ComplaintStatus, Tone> = { open: 'red', reviewing: 'amber', resolved: 'green' };
const STATUSES: ComplaintStatus[] = ['open', 'reviewing', 'resolved'];

export function MyComplaints({ workerId }: { workerId: string }) {
  const all = useComplaints((s) => s.complaints);
  const mine = useMemo(() => all.filter((c) => c.fromWorkerId === workerId).reverse(), [all, workerId]);

  return (
    <Card>
      <CardHeader icon={Inbox} title="My complaints" subtitle="See what the authority is doing about them" />
      {mine.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints filed" />
      ) : (
        <ul className="space-y-3">
          {mine.map((c) => (
            <li key={c.id} className="rounded-xl border border-zinc-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {c.category} | against {c.against}
                </p>
                <Badge tone={STATUS_TONE[c.status]} className="capitalize">
                  {c.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-600">{c.message}</p>
              <p className="mt-2 text-xs text-zinc-400">
                {fmtDate(c.createdAt)}
                {c.anonymous ? ' | filed anonymously' : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function ComplaintsInbox() {
  const complaints = useComplaints((s) => s.complaints);
  const setStatus = useComplaints((s) => s.setStatus);
  const workers = useWorkforce((s) => s.workers);
  const sorted = useMemo(() => [...complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [complaints]);
  const unresolved = complaints.filter((c) => c.status !== 'resolved').length;

  return (
    <Card>
      <CardHeader
        icon={MessageSquareWarning}
        title="Worker complaints"
        subtitle="Filed from workers' phones"
        action={<Badge tone={unresolved ? 'red' : 'green'}>{unresolved} unresolved</Badge>}
      />
      {sorted.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints" />
      ) : (
        <ul className="space-y-3">
          {sorted.map((c) => {
            const from = c.anonymous ? 'Anonymous worker' : (workers.find((w) => w.id === c.fromWorkerId)?.name ?? 'Unknown');
            return (
              <li key={c.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{c.category}</Badge>
                  <span className="text-sm font-semibold">Against {c.against}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{c.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-zinc-500">
                    From {from} | {fmtDate(c.createdAt)}
                  </p>
                  <div className="inline-flex rounded-lg bg-zinc-100 p-0.5">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(c.id, st)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition',
                          c.status === st ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800',
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}