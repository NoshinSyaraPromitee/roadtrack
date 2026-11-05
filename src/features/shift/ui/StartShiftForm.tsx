import { useState } from 'react';
import { ClipboardList, HardHat, Package, Play, Users } from 'lucide-react';
import { MATERIAL_CATALOG } from '@/core/seed';
import { PAYROLL_RULES } from '@/core/payroll';
import { useWorkforce } from '@/features/workforce';
import { Badge, Button, Card, CardHeader, Field, Input } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useShiftStore } from '../model/store';
import { useProjectProgress } from '../model/selectors';

export function StartShiftForm() {
  const workers = useWorkforce((s) => s.workers);
  const startShift = useShiftStore((s) => s.startShift);
  const progress = useProjectProgress();

  const [site, setSite] = useState('Chainage 2+400 to 3+000');
  const [startProgress, setStartProgress] = useState(String(progress));
  const [selected, setSelected] = useState<string[]>(() => workers.map((w) => w.id));
  const [materials, setMaterials] = useState(() => MATERIAL_CATALOG.map((m) => ({ ...m, allocated: String(m.defaultQty) })));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = selected.length === workers.length;

  const postSummary = Object.entries(
    workers
      .filter((w) => selected.includes(w.id))
      .reduce<Record<string, number>>((acc, w) => ({ ...acc, [w.post]: (acc[w.post] ?? 0) + 1 }), {}),
  );

  const submit = () => {
    const errs: Record<string, string> = {};
    const sp = Number(startProgress);
    if (!site.trim()) errs.site = 'Enter the work location';
    if (startProgress.trim() === '' || Number.isNaN(sp) || sp < 0 || sp > 100) errs.progress = 'Progress must be between 0 and 100';
    if (selected.length === 0) errs.workers = 'Clock in at least one worker';
    if (materials.some((m) => m.allocated.trim() === '' || Number.isNaN(Number(m.allocated)) || Number(m.allocated) < 0)) {
      errs.materials = 'Issued quantities must be 0 or more';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    startShift({
      site: site.trim(),
      startProgress: sp,
      workerIds: selected,
      materials: materials.map((m) => ({ name: m.name, unit: m.unit, allocated: Number(m.allocated) })),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader icon={ClipboardList} title="Shift details" subtitle="Where is the crew working today?" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work location" error={errors.site}>
            <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g. Chainage 2+400 to 3+000" />
          </Field>
          <Field label="Road progress so far (%)" hint={`Last recorded: ${progress}%`} error={errors.progress}>
            <Input type="number" step="0.1" min={0} max={100} value={startProgress} onChange={(e) => setStartProgress(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={Users}
          title="Clock in workers"
          subtitle={`${selected.length} of ${workers.length} on site`}
          action={
            <Button size="sm" variant="ghost" onClick={() => setSelected(allSelected ? [] : workers.map((w) => w.id))}>
              {allSelected ? 'Clear all' : 'Select all'}
            </Button>
          }
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {postSummary.map(([post, count]) => (
            <Badge key={post} tone="amber">
              {count} x {post}
            </Badge>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {workers.map((w) => {
            const on = selected.includes(w.id);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => toggle(w.id)}
                aria-pressed={on}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                  on ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400' : 'border-zinc-200 bg-white hover:border-zinc-300',
                )}
              >
                <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full', on ? 'bg-amber-400 text-zinc-900' : 'bg-zinc-100 text-zinc-400')}>
                  <HardHat className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{w.name}</p>
                  <p className="text-xs text-zinc-500">
                    {w.post} | Age {w.age}
                  </p>
                  {w.age >= PAYROLL_RULES.seniorAge && (
                    <Badge tone="blue" className="mt-1">
                      Senior
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {errors.workers && <p className="mt-3 text-xs font-medium text-red-600">{errors.workers}</p>}
      </Card>

      <Card>
        <CardHeader icon={Package} title="Materials for the day" subtitle="Quantity issued to the site at clock-in" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {materials.map((m, i) => (
            <Field key={m.name} label={`${m.name} (${m.unit})`}>
              <Input
                type="number"
                min={0}
                value={m.allocated}
                onChange={(e) => setMaterials((list) => list.map((x, j) => (j === i ? { ...x, allocated: e.target.value } : x)))}
              />
            </Field>
          ))}
        </div>
        {errors.materials && <p className="mt-3 text-xs font-medium text-red-600">{errors.materials}</p>}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          <Play className="h-4 w-4" /> Clock in & start shift
        </Button>
      </div>
    </form>
  );
}