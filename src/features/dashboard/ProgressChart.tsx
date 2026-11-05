import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCompletedShifts } from '@/features/shift';
import { Card, CardHeader } from '@/shared/ui';
import { fmtShortDate } from '@/shared/lib/utils';

export function ProgressChart() {
  const shifts = useCompletedShifts();
  const data = shifts.map((s) => ({ date: fmtShortDate(s.startedAt), progress: s.endProgress ?? s.startProgress }));

  return (
    <Card>
      <CardHeader icon={TrendingUp} title="Road progress" subtitle="Completion after each shift (%)" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="progress" stroke="#d97706" strokeWidth={2.5} fill="url(#progressFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}