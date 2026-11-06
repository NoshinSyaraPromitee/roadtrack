import type { HealthReport } from './types';

const DAY = 86_400_000;
const dayStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

export interface SickDays {
  streak: number;
  month: number;
}

export function sickDays(reports: HealthReport[], workerId: string, now = new Date()): SickDays {
  const byDay = new Map<number, HealthReport['status']>();
  reports
    .filter((r) => r.workerId === workerId)
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach((r) => byDay.set(dayStart(new Date(r.at)), r.status));
  const days = [...byDay.entries()].sort((a, b) => b[0] - a[0]);
  const today = dayStart(now);

  let streak = 0;
  if (days.length && days[0][1] !== 'fit' && today - days[0][0] <= DAY) {
    let first = days[0][0];
    for (const [d, s] of days) {
      if (s === 'fit') break;
      first = d;
    }
    streak = Math.round((today - first) / DAY) + 1;
  }
  const month = days.filter(([d, s]) => d > today - 30 * DAY && s !== 'fit').length;
  return { streak, month };
}
