import { useState } from 'react';
import { CheckCircle2, Hourglass, Send, TrendingUp } from 'lucide-react';
import type { Worker } from '@/core/types';
import { Button, Card, CardHeader, Field, Input, Select, Textarea } from '@/shared/ui';
import { taka } from '@/shared/lib/utils';
import { useRaiseRequests } from './store';

const REASONS = ['Additional responsibility', 'Experience or new skill', 'Cost of living', 'Hazardous work', 'Health or family need', 'Other'];

export function RaiseRequestForm({ worker }: { worker: Worker }) {
  const request = useRaiseRequests((s) => s.request);
  const hasPending = useRaiseRequests((s) => s.requests.some((r) => r.workerId === worker.id && r.status === 'pending'));

  const [rate, setRate] = useState(String(worker.dailyRate + 100));
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const requested = Number(rate);
  const increase = requested > 0 ? ((requested - worker.dailyRate) / worker.dailyRate) * 100 : 0;

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!Number.isFinite(requested) || requested <= worker.dailyRate) errs.rate = `Must be more than your current ${taka(worker.dailyRate)}`;
    else if (requested > worker.dailyRate * 1.5) errs.rate = 'Requests above +50% are not accepted';
    if (details.trim().length < 15) errs.details = 'Explain your reason in at least 15 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    request({ workerId: worker.id, currentRate: worker.dailyRate, requestedRate: Math.round(requested), reason, details: details.trim() });
    setDetails('');
    setSent(true);
  };

  return (
    <Card>
      <CardHeader icon={TrendingUp} title="Request a raise" subtitle={`Your current daily rate is ${taka(worker.dailyRate)}`} />
      {hasPending ? (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          {sent ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Hourglass className="mt-0.5 h-5 w-5 shrink-0" />}
          <p>
            {sent ? 'Request sent. ' : ''}Your request is waiting for the authority's decision. You can submit a new one after it is reviewed.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Requested daily rate (BDT)" error={errors.rate} hint={increase > 0 ? `+${increase.toFixed(1)}% increase` : undefined}>
              <Input type="number" min={worker.dailyRate + 1} value={rate} onChange={(e) => setRate(e.target.value)} />
            </Field>
            <Field label="Reason">
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Details" error={errors.details}>
            <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. I have been operating the roller alone for 2 months." />
          </Field>
          <div className="flex justify-end">
            <Button type="submit">
              <Send className="h-4 w-4" /> Send request
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}