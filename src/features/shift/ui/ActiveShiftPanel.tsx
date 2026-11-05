import { Clock, HardHat, MapPin, Package, TrendingUp, Users } from 'lucide-react';
import type { Shift } from '@/core/types';
import { PAYROLL_RULES } from '@/core/payroll';
import { useWorkforce } from '@/features/workforce';
import { Badge, Card, CardHeader } from '@/shared/ui';
import { fmtDuration, fmtTime } from '@/shared/lib/utils';
import { useNow } from '@/shared/lib/useNow';

export function ActiveShiftPanel({ shift }: { shift: Shift }) {
  const workers = useWorkforce((s) => s.workers);
  const now = useNow();
  const elapsed = now - new Date(shift.startedAt).getTime();
  const crew = shift.attendance.flatMap((a) => {
    const w = workers.find((x) => x.id === a.workerId);
    return w ? [w] : [];
  });

  const stats = [
    { icon: Clock, label: 'Clocked in', value: fmtTime(shift.startedAt) },
    { icon: Users, label: 'Headcount', value: String(shift.attendance.length) },
    { icon: TrendingUp, label: 'Start progress', value: `${shift.startProgress}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-lg">
        <div className="hazard h-2" />
        <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Shift in progress
            </div>
            <p className="mt-3 font-mono text-5xl font-bold tracking-tight tabular-nums">{fmtDuration(elapsed)}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="h-4 w-4" />
              {shift.site}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <Icon className="mx-auto h-4 w-4 text-amber-400" />
                <p className="mt-2 text-lg font-bold">{value}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={HardHat} title="Crew on site" subtitle={`${crew.length} workers clocked in`} />
          <ul className="divide-y divide-zinc-100">
            {crew.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs text-zinc-500">{w.post}</p>
                </div>
                {w.age >= PAYROLL_RULES.seniorAge && <Badge tone="blue">Senior | {w.age}</Badge>}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader icon={Package} title="Materials issued" subtitle="Usage is recorded at the end of the shift" />
          <ul className="divide-y divide-zinc-100">
            {shift.materials.map((m) => (
              <li key={m.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold">{m.name}</span>
                <span className="tabular-nums text-zinc-600">
                  {m.allocated} {m.unit}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}