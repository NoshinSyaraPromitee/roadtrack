import { Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MATERIAL_CATALOG } from '@/core/seed';
import { useCompletedShifts } from '@/features/shift';
import { Card, CardHeader } from '@/shared/ui';
import { pct, sum } from '@/shared/lib/utils';

export function WastageChart() {
  const shifts = useCompletedShifts();
  const data = MATERIAL_CATALOG.map((m) => {
    const lines = shifts.flatMap((s) => s.materials.filter((x) => x.name === m.name));
    const used = sum(lines.map((l) => l.used));
    const wasted = sum(lines.map((l) => l.wasted));
    return { name: m.name, wastage: Math.round(pct(wasted, used + wasted) * 10) / 10 };
  });

  return (
    <Card>
      <CardHeader icon={Trash2} title="Material wastage" subtitle="Wasted share of each material (%), 5% limit marked" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 4" />
            <Bar dataKey="wastage" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}