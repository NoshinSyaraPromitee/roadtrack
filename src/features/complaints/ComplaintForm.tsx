import { useState } from 'react';
import { CheckCircle2, MessageSquareWarning, Send } from 'lucide-react';
import { PROJECT } from '@/core/seed';
import { useWorkforce } from '@/features/workforce';
import { Button, Card, CardHeader, Field, Select, Switch, Textarea } from '@/shared/ui';
import { useComplaints } from './store';

const CATEGORIES = ['Misconduct', 'Safety', 'Payment', 'Harassment', 'Working conditions', 'Other'];

export function ComplaintForm({ workerId }: { workerId: string }) {
  const workers = useWorkforce((s) => s.workers);
  const file = useComplaints((s) => s.file);
  const supervisorLabel = `${PROJECT.supervisor} (Supervisor)`;

  const [against, setAgainst] = useState(supervisorLabel);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (message.trim().length < 15) {
      setError('Please describe the issue in at least 15 characters.');
      return;
    }
    file({ fromWorkerId: workerId, against, category, message: message.trim(), anonymous });
    setMessage('');
    setError('');
    setSent(true);
    window.setTimeout(() => setSent(false), 3000);
  };

  return (
    <Card>
      <CardHeader icon={MessageSquareWarning} title="File a complaint" subtitle="About a co-worker or the supervisor. Goes straight to the higher authority." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Against">
            <Select value={against} onChange={(e) => setAgainst(e.target.value)}>
              <option value={supervisorLabel}>{supervisorLabel}</option>
              {workers
                .filter((w) => w.id !== workerId)
                .map((w) => {
                  const label = `${w.name} (${w.post})`;
                  return (
                    <option key={w.id} value={label}>
                      {label}
                    </option>
                  );
                })}
              <option value="Other / not listed">Other / not listed</option>
            </Select>
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="What happened?" error={error}>
          <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue, when and where it happened." />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <Switch checked={anonymous} onChange={setAnonymous} label="File anonymously" />
            Hide my name from the report
          </div>
          <Button type="submit" variant="dark">
            <Send className="h-4 w-4" /> Submit complaint
          </Button>
        </div>
        {sent && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Complaint sent to the higher authority.
          </p>
        )}
      </form>
    </Card>
  );
}