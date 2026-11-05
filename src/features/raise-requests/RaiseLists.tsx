import { useMemo } from 'react';
import { Check, HandCoins, Inbox, X } from 'lucide-react';
import type { RaiseRequest, RaiseStatus } from '@/core/types';
import { useWorkforce } from '@/features/workforce';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/shared/ui';
import type { Tone } from '@/shared/ui';
import { fmtDate, taka } from '@/shared/lib/utils';
import { useRaiseRequests } from './store';

const TONE: Record<RaiseStatus, Tone> = { pending: 'amber', approved: 'green', rejected: 'red' };

export function MyRaiseRequests({ workerId }: { workerId: string }) {
  const all = useRaiseRequests((s) => s.requests);
  const mine = useMemo(() => all.filter((r) => r.workerId === workerId).reverse(), [all, workerId]);
  if (mine.length === 0) return null;

  return (
    <Card>
      <CardHeader icon={HandCoins} title="My raise requests" />
      <ul className="divide-y divide-zinc-100">
        {mine.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-semibold">
                {taka(r.currentRate)} to {taka(r.requestedRate)}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {r.reason} | {fmtDate(r.createdAt)}
              </p>
            </div>
            <Badge tone={TONE[r.status]} className="capitalize">
              {r.status}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function RaiseInbox() {
  const requests = useRaiseRequests((s) => s.requests);
  const decide = useRaiseRequests((s) => s.decide);
  const workers = useWorkforce((s) => s.workers);
  const updateRate = useWorkforce((s) => s.updateRate);

  const sorted = useMemo(
    () => [...requests].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.createdAt.localeCompare(a.createdAt)),
    [requests],
  );
  const pending = requests.filter((r) => r.status === 'pending').length;

  const approve = (r: RaiseRequest) => {
    decide(r.id, 'approved');
    updateRate(r.workerId, r.requestedRate);
  };

  return (
    <Card>
      <CardHeader
        icon={HandCoins}
        title="Raise requests"
        subtitle="Approving updates the worker's daily rate"
        action={<Badge tone={pending ? 'amber' : 'green'}>{pending} pending</Badge>}
      />
      {sorted.length === 0 ? (
        <EmptyState icon={Inbox} title="No raise requests" />
      ) : (
        <ul className="space-y-3">
          {sorted.map((r) => {
            const w = workers.find((x) => x.id === r.workerId);
            const pctUp = ((r.requestedRate - r.currentRate) / r.currentRate) * 100;
            return (
              <li key={r.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{w?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-zinc-500">
                      {w?.post} | {fmtDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">
                      {taka(r.currentRate)} to {taka(r.requestedRate)}
                    </p>
                    <p className="text-xs text-emerald-700">+{pctUp.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">{r.reason}:</span> <span className="text-zinc-600">{r.details}</span>
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  {r.status === 'pending' ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => decide(r.id, 'rejected')}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                      <Button size="sm" variant="success" onClick={() => approve(r)}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                    </>
                  ) : (
                    <Badge tone={TONE[r.status]} className="capitalize">
                      {r.status}
                    </Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}