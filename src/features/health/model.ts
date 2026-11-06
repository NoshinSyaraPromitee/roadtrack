import type { Health, HealthReport } from '@/core/types';
import type { Text } from '@/shared/i18n';

export { sickDays } from '@/core/health';
export type { SickDays } from '@/core/health';

const sameDay = (iso: string, now = new Date()) => new Date(iso).toDateString() === now.toDateString();

export function todaysReport(reports: HealthReport[], workerId: string): HealthReport | undefined {
  const mine = reports.filter((r) => r.workerId === workerId && sameDay(r.at));
  return mine.sort((a, b) => a.at.localeCompare(b.at))[mine.length - 1];
}

export function todaysReports(reports: HealthReport[]): HealthReport[] {
  const ids = Array.from(new Set(reports.filter((r) => sameDay(r.at)).map((r) => r.workerId)));
  return ids.map((id) => todaysReport(reports, id)).filter((r): r is HealthReport => !!r);
}

export const HEALTH_LABEL: Record<Health, Text> = {
  fit: { en: 'Feeling well', bn: 'ভালো আছি' },
  sick: { en: 'Feeling sick', bn: 'অসুস্থ' },
  injured: { en: 'Hurt', bn: 'আহত' },
};
