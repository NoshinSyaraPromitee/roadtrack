import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Flag, Package, Users } from 'lucide-react';
import type { Attendance, Health, MaterialLine, Shift } from '@/core/types';
import { PAYROLL_RULES, calculatePayroll, payrollTotal } from '@/core/payroll';
import { useWorkforce } from '@/features/workforce';
import { PayrollTable } from '@/features/payroll';
import { Badge, Button, Card, CardHeader, Field, Input, Select, Switch, Textarea } from '@/shared/ui';
import { cn, taka } from '@/shared/lib/utils';
import { useShiftStore } from '../model/store';

interface Row {
  workerId: string;
  presentAtStart: boolean;
  presentAtEnd: boolean;
  health: Health;
  output: string;
}

interface MatRow {
  name: string;
  unit: string;
  allocated: number;
  used: string;
  wasted: string;
}

const num = (v: string) => (v.trim() === '' ? NaN : Number(v));

export function EndShiftForm({ shift, onEnded }: { shift: Shift; onEnded: (id: string) => void }) {
  const workers = useWorkforce((s) => s.workers);
  const endShift = useShiftStore((s) => s.endShift);

  const [rows, setRows] = useState<Row[]>(() => shift.attendance.map((a) => ({ ...a, output: a.output ? String(a.output) : '' })));
  const [mats, setMats] = useState<MatRow[]>(() => shift.materials.map((m) => ({ ...m, used: '', wasted: '0' })));
  const [endProgress, setEndProgress] = useState('');
  const [incidents, setIncidents] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const attendance = useMemo<Attendance[]>(() => rows.map((r) => ({ ...r, output: Number(r.output) || 0 })), [rows]);
  const preview = useMemo(() => calculatePayroll(workers, attendance), [workers, attendance]);
  const stillOnSite = rows.filter((r) => r.presentAtEnd).length;

  const update = (id: string, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.workerId === id ? { ...r, ...patch } : r)));
  const updateMat = (i: number, patch: Partial<MatRow>) => setMats((list) => list.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  const submit = () => {
    const errs: string[] = [];
    const ep = num(endProgress);
    if (Number.isNaN(ep) || ep < shift.startProgress || ep > 100) {
      errs.push(`Road progress must be between ${shift.startProgress}% and 100%.`);
    }
    mats.forEach((m) => {
      const u = num(m.used);
      const w = num(m.wasted);
      if (Number.isNaN(u) || u < 0 || Number.isNaN(w) || w < 0) errs.push(`Enter valid used and wasted quantities for ${m.name}.`);
      else if (u + w > m.allocated) errs.push(`${m.name}: used + wasted (${u + w}) is more than the ${m.allocated} ${m.unit} issued.`);
    });
    if (rows.some((r) => Number(r.output) < 0)) errs.push('Work done cannot be negative.');

    const heavyWaste = mats.some((m) => num(m.wasted) > m.allocated * 0.05);
    const injured = rows.some((r) => r.health === 'injured');
    if ((heavyWaste || injured) && incidents.trim().length < 10) {
      errs.push('Wastage above 5% or an injury was recorded. Describe what happened in the incident notes.');
    }

    setErrors(errs);
    if (errs.length) return;
    if (!window.confirm('End this shift and send the payroll to the higher authority?')) return;

    const materials: MaterialLine[] = mats.map((m) => ({ name: m.name, unit: m.unit, allocated: m.allocated, used: num(m.used), wasted: num(m.wasted) }));
    const id = endShift({ attendance, materials, endProgress: ep, incidents: incidents.trim() }, workers);
    if (id) onEnded(id);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 pt-2">
        <div className="hazard h-1 flex-1 rounded-full opacity-60" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">End of shift</span>
        <div className="hazard h-1 flex-1 rounded-full opacity-60" />
      </div>

      <Card>
        <CardHeader
          icon={Users}
          title="Recount workers"
          subtitle={`${stillOnSite} of ${rows.length} still on site`}
          action={stillOnSite < rows.length ? <Badge tone="red">{rows.length - stillOnSite} missing</Badge> : <Badge tone="green">All present</Badge>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-2 font-semibold">Worker</th>
                <th className="pb-2 font-semibold">On site</th>
                <th className="pb-2 font-semibold">Health</th>
                <th className="pb-2 font-semibold">Work done (m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r) => {
                const w = workers.find((x) => x.id === r.workerId);
                return (
                  <tr key={r.workerId}>
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold">{w?.name}</p>
                      <p className="text-xs text-zinc-500">
                        {w?.post} | Age {w?.age}
                      </p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Switch checked={r.presentAtEnd} onChange={(v) => update(r.workerId, { presentAtEnd: v })} label={`${w?.name ?? 'Worker'} present at recount`} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="w-32">
                        <Select value={r.health} onChange={(e) => update(r.workerId, { health: e.target.value as Health })}>
                          <option value="fit">Fit</option>
                          <option value="sick">Sick</option>
                          <option value="injured">Injured</option>
                        </Select>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="w-28">
                        <Input type="number" min={0} placeholder="0" value={r.output} onChange={(e) => update(r.workerId, { output: e.target.value })} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Package} title="Materials used & wasted" subtitle="Left over = issued - used - wasted" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-2 font-semibold">Material</th>
                <th className="pb-2 font-semibold">Issued</th>
                <th className="pb-2 font-semibold">Used</th>
                <th className="pb-2 font-semibold">Wasted</th>
                <th className="pb-2 font-semibold">Left over</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {mats.map((m, i) => {
                const left = m.allocated - (Number(m.used) || 0) - (Number(m.wasted) || 0);
                return (
                  <tr key={m.name}>
                    <td className="py-2.5 pr-3 font-semibold">{m.name}</td>
                    <td className="py-2.5 pr-3 tabular-nums text-zinc-500">
                      {m.allocated} {m.unit}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="w-28">
                        <Input type="number" min={0} placeholder="0" value={m.used} onChange={(e) => updateMat(i, { used: e.target.value })} />
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="w-28">
                        <Input type="number" min={0} value={m.wasted} onChange={(e) => updateMat(i, { wasted: e.target.value })} />
                      </div>
                    </td>
                    <td className={cn('py-2.5 font-semibold tabular-nums', left < 0 ? 'text-red-600' : 'text-zinc-700')}>
                      {left} {m.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Flag} title="Progress & incidents" subtitle="Record anything that went wrong today" />
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <Field label="Road progress now (%)" hint={`Started today at ${shift.startProgress}%`}>
            <Input type="number" step="0.1" min={shift.startProgress} max={100} value={endProgress} onChange={(e) => setEndProgress(e.target.value)} />
          </Field>
          <Field label="Incidents, mistakes or wastage notes" hint="Required if wastage is above 5% or someone was injured">
            <Textarea
              rows={3}
              value={incidents}
              onChange={(e) => setIncidents(e.target.value)}
              placeholder="e.g. Wrong camber on a 20 m stretch, re-laid. Two bags of cement got wet in the rain."
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={ClipboardCheck}
          title="Payroll preview"
          subtitle={`Senior ${PAYROLL_RULES.seniorAge}+ gets +${PAYROLL_RULES.seniorBonusPct}% | Sick or injured +${PAYROLL_RULES.healthBonusPct}% | Missing at recount -${PAYROLL_RULES.earlyLeaveCutPct}%`}
          action={<Badge tone="amber">{taka(payrollTotal(preview))}</Badge>}
        />
        <PayrollTable lines={preview} />
      </Card>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" /> Please fix the following
          </p>
          <ul className="list-disc space-y-0.5 pl-6">
            {errors.map((er) => (
              <li key={er}>{er}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" size="lg">
          <CheckCircle2 className="h-4 w-4" /> End shift & send payroll
        </Button>
      </div>
    </form>
  );
}