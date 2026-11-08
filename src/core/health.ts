import type { HealthReport } from './types';

const DAY = 86_400_000;
const dayStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const isSameDay = (iso: string, now: Date | number = new Date()) => new Date(iso).toDateString() === new Date(now).toDateString();

/** The worker's latest report from today, if any. */
export function todaysReport(reports: HealthReport[], workerId: string, now: Date | number = new Date()): HealthReport | undefined {
  const mine = reports.filter((r) => r.workerId === workerId && isSameDay(r.at, now));
  return mine.sort((a, b) => a.at.localeCompare(b.at))[mine.length - 1];
}

/** One latest report per worker, from today only. */
export function todaysReports(reports: HealthReport[], now: Date | number = new Date()): HealthReport[] {
  const ids = Array.from(new Set(reports.filter((r) => isSameDay(r.at, now)).map((r) => r.workerId)));
  return ids.map((id) => todaysReport(reports, id, now)).filter((r): r is HealthReport => !!r);
}

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
