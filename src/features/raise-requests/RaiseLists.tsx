import { useMemo } from 'react';
import { Check, HandCoins, Inbox, X } from 'lucide-react';
import type { RaiseRequest } from '@/core/types';
import { RAISE_REASONS } from '@/core/catalog';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { VoiceNote } from '@/shared/voice';
import { Badge, Button, Card, CardHeader, EmptyState, Pictogram } from '@/shared/ui';
import { RAISE_STATUS, REASON_ICON } from './meta';
import { useRaiseRequests } from './store';

export function MyRaiseRequests({ workerId }: { workerId: string }) {
  const i = useI18n();
  const all = useRaiseRequests((s) => s.requests);
  const mine = useMemo(() => all.filter((r) => r.workerId === workerId).reverse(), [all, workerId]);
  if (mine.length === 0) return null;

  return (
    <Card>
      <CardHeader icon={HandCoins} title={i.t('My requests', 'আমার আবেদন')} />
      <ul className="divide-y divide-line">
        {mine.map((r) => {
          const st = RAISE_STATUS[r.status];
          return (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <Pictogram icon={REASON_ICON[r.reason]} tone="sign" shape="disc" size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-sign text-xl tabular-nums">
                  {i.taka(r.currentRate)} → {i.taka(r.requestedRate)}
                </p>
                <p className="truncate text-sm text-ink-soft">{i.date(r.createdAt)}</p>
              </div>
              <Badge tone={st.tone} icon={st.icon}>
                {i.tx(st.label)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function RaiseInbox() {
  const i = useI18n();
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
        title={i.t('Pay raise requests', 'বেতন বৃদ্ধির আবেদন')}
        subtitle={i.t("Approving changes the worker's daily pay.", 'অনুমোদন করলে শ্রমিকের দৈনিক মজুরি বদলে যাবে।')}
        action={
          <Badge tone={pending ? 'yellow' : 'green'} icon={RAISE_STATUS.pending.icon}>
            {i.t(`${i.num(pending)} waiting`, `${i.num(pending)}টি অপেক্ষায়`)}
          </Badge>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState icon={Inbox} title={i.t('No requests', 'কোনো আবেদন নেই')} />
      ) : (
        <ul className="space-y-3">
          {sorted.map((r) => {
            const w = workers.find((x) => x.id === r.workerId);
            const st = RAISE_STATUS[r.status];
            return (
              <li key={r.id} className="rounded-2xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {w && <Avatar person={w} size={48} />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{w ? personName(w, i.lang) : '—'}</p>
                    <p className="text-sm text-ink-soft">
                      {w ? i.tx(roleOf(w)) : ''} {i.date(r.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sign text-2xl tabular-nums">
                      {i.taka(r.currentRate)} → {i.taka(r.requestedRate)}
                    </p>
                    <p className="font-semibold text-guide-700">+{i.fixed(((r.requestedRate - r.currentRate) / r.currentRate) * 100)}%</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Pictogram icon={REASON_ICON[r.reason]} tone="sign" shape="disc" size={32} />
                  <span className="font-semibold">{i.tx(RAISE_REASONS[r.reason])}</span>
                </div>
                <div className="mt-2 space-y-2">
                  {r.audio && <VoiceNote src={r.audio} />}
                  {r.details && <p>{r.details}</p>}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  {r.status === 'pending' ? (
                    <>
                      <Button variant="secondary" onClick={() => decide(r.id, 'rejected')}>
                        <X />
                        {i.t('Say no', 'না করুন')}
                      </Button>
                      <Button onClick={() => approve(r)}>
                        <Check />
                        {i.t('Approve', 'অনুমোদন দিন')}
                      </Button>
                    </>
                  ) : (
                    <Badge tone={st.tone} icon={st.icon}>
                      {i.tx(st.label)}
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