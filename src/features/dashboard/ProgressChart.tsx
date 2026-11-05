import { Construction } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCompletedShifts } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { Card, CardHeader } from '@/shared/ui';

export function ProgressChart() {
  const i = useI18n();
  const shifts = useCompletedShifts();
  const data = shifts.map((s) => ({ date: i.date(s.startedAt), progress: s.endProgress ?? s.startProgress }));

  return (
    <Card>
      <CardHeader icon={Construction} tone="mark" title={i.t('Road done after each shift', 'প্রতি শিফটের পর অগ্রগতি')} subtitle={i.t('Percent of the whole road', 'পুরো রাস্তার শতাংশ')} />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e8459" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0e8459" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dad4" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#56615b' }} axisLine={false} tickLine={false} minTickGap={12} />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(v: number) => i.num(v, 1)}
              tick={{ fontSize: 13, fill: '#56615b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => [`${i.fixed(Number(v))}%`, i.t('Road done', 'রাস্তার কাজ')]} />
            <Area type="monotone" dataKey="progress" stroke="#0a6b4a" strokeWidth={3} fill="url(#progressFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}