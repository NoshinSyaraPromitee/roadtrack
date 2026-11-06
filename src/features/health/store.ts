import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthReport } from '@/core/types';
import { SEED_HEALTH } from '@/core/seed';
import { uid } from '@/shared/lib/utils';

export type NewHealthReport = Omit<HealthReport, 'id' | 'at'>;

interface HealthState {
  reports: HealthReport[];
  report: (r: NewHealthReport) => void;
}

export const useHealthReports = create<HealthState>()(
  persist(
    (set) => ({
      reports: SEED_HEALTH,
      report: (r) => set((s) => ({ reports: [...s.reports, { ...r, id: uid('h'), at: new Date().toISOString() }] })),
    }),
    { name: 'roadtrack-v4-health' },
  ),
);
