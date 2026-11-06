import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MaterialKey, Text } from '@/core/types';

export interface DayPlan {
  site: Text;
  startProgress: number;
  workerIds: string[];
  materials: Array<{ key: MaterialKey; allocated: number }>;
}

export interface DaySetup {
  day: string;
  plan?: DayPlan;
  machinesOk: boolean;
  healthOk: boolean;
}

const today = () => new Date().toDateString();
const blank = (): DaySetup => ({ day: today(), machinesOk: false, healthOk: false });

export const setupFor = (byRoad: Record<string, DaySetup>, roadId: string): DaySetup => {
  const s = byRoad[roadId];
  return s && s.day === today() ? s : blank();
};

interface DaySetupState {
  byRoad: Record<string, DaySetup>;
  update: (roadId: string, patch: Partial<Omit<DaySetup, 'day'>>) => void;
  clear: (roadId: string) => void;
}

export const useDaySetupStore = create<DaySetupState>()(
  persist(
    (set) => ({
      byRoad: {},
      update: (roadId, patch) => set((s) => ({ byRoad: { ...s.byRoad, [roadId]: { ...setupFor(s.byRoad, roadId), ...patch } } })),
      clear: (roadId) =>
        set((s) => {
          const byRoad = { ...s.byRoad };
          delete byRoad[roadId];
          return { byRoad };
        }),
    }),
    { name: 'roadtrack-v3-day-setup' },
  ),
);
