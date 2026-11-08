import { Check, CircleCheck, CircleX, Hourglass, UserPlus, X } from 'lucide-react';
import type { Registration } from '@/core/registrations';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/shared/ui';
import { useRegistrations } from './registrationStore';

const PROVIDER = { phone: { en: 'Phone and password', bn: 'ফোন ও পাসওয়ার্ড' }, google: { en: 'Google', bn: 'Google' }, apple: { en: 'Apple', bn: 'Apple' } };

function Row({ r }: { r: Registration }) {
  const i = useI18n();
  const decide = useRegistrations((s) => s.decide);
  return (
    <li className="space-y-3 py-4">
      <div className="min-w-0">
        <p className="font-sign text-2xl leading-tight">{r.name}</p>
        <p className="font-semibold">{r.company}</p>
        <dl className="mt-2 grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-[0.95rem] text-ink-soft">
          <dt>{i.t('Trade licence', 'ট্রেড লাইসেন্স')}</dt>
          <dd className="font-semibold text-ink">{r.licence}</dd>
          <dt>{i.t('Phone', 'ফোন')}</dt>
          <dd className="tabular-nums text-ink">{r.phone}</dd>
          {r.email && (
            <>
              <dt>{i.t('Email', 'ইমেইল')}</dt>
              <dd className="break-all text-ink">{r.email}</dd>
            </>
          )}
          <dt>{i.t('Signed up with', 'নিবন্ধনের মাধ্যম')}</dt>
          <dd>{i.tx(PROVIDER[r.provider])}</dd>
          <dt>{i.t('Sent', 'পাঠানো')}</dt>
          <dd>{i.date(r.createdAt)}</dd>
        </dl>
      </div>
      {r.status === 'pending' ? (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="secondary" onClick={() => decide(r.id, 'rejected')}>
            <X />
            {i.t('Reject', 'বাতিল')}
          </Button>
          <Button onClick={() => decide(r.id, 'approved')}>
            <Check />
            {i.t('Approve', 'অনুমোদন')}
          </Button>
        </div>
      ) : (
        <Badge tone={r.status === 'approved' ? 'green' : 'red'} icon={r.status === 'approved' ? CircleCheck : CircleX}>
          {r.status === 'approved' ? i.t('Approved', 'অনুমোদিত') : i.t('Rejected', 'বাতিল')}
        </Badge>
      )}
    </li>
  );
}

export function SignupRequests() {
  const { t } = useI18n();
  const list = useRegistrations((s) => s.list);
  const pending = list.filter((r) => r.status === 'pending');
  const decided = list.filter((r) => r.status !== 'pending');

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
      <Card>
        <CardHeader icon={Hourglass} title={t('Waiting for approval', 'অনুমোদনের অপেক্ষায়')} />
        {pending.length ? (
          <ul className="divide-y divide-line">{pending.map((r) => <Row key={r.id} r={r} />)}</ul>
        ) : (
          <EmptyState icon={UserPlus} title={t('No new sign-ups', 'নতুন কোনো নিবন্ধন নেই')} />
        )}
      </Card>
      <Card>
        <CardHeader icon={CircleCheck} title={t('Decided', 'সিদ্ধান্ত হয়েছে')} />
        {decided.length ? (
          <ul className="divide-y divide-line">{decided.map((r) => <Row key={r.id} r={r} />)}</ul>
        ) : (
          <p className="text-ink-soft">{t('Nothing decided yet.', 'এখনো কোনো সিদ্ধান্ত হয়নি।')}</p>
        )}
      </Card>
    </div>
  );
}
