import { Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MATERIALS } from '@/core/catalog';
import { useCompletedShifts } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { Card, CardHeader } from '@/shared/ui';
import { pct, sum } from '@/shared/lib/utils';

const LIMIT = 5;

export function WastageChart() {
  const i = useI18n();
  const shifts = useCompletedShifts();
  const data = MATERIALS.map((m) => {
    const lines = shifts.flatMap((s) => s.materials.filter((x) => x.key === m.key));
    const used = sum(lines.map((l) => l.used));
    const wasted = sum(lines.map((l) => l.wasted));
    return { name: i.tx(m.name), wastage: Math.round(pct(wasted, used + wasted) * 10) / 10 };
  });

  return (
    <Card>
      <CardHeader
        icon={Trash2}
        tone="stop"
        shape="warn"
        title={i.t('Material wasted', 'কতটা মাল নষ্ট')}
      />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dad4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#56615b' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tickFormatter={(v: number) => i.num(v, 1)} tick={{ fontSize: 13, fill: '#56615b' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`${i.fixed(Number(v))}%`, i.t('Wasted', 'নষ্ট')]} />
            <ReferenceLine y={LIMIT} stroke="#d3263a" strokeDasharray="5 4" strokeWidth={2} />
            <Bar dataKey="wastage" radius={[8, 8, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.wastage > LIMIT ? '#d3263a' : '#ffc930'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
