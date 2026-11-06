import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MaterialKey, Text } from '@/core/types';

/** What the supervisor planned in step 1: who came, the materials, the place and the road done so far. */
export interface DayPlan {
  site: Text;
  startProgress: number;
  workerIds: string[];
  materials: Array<{ key: MaterialKey; allocated: number }>;
}

/** How far the supervisor got in today's steps on one road. */
export interface DaySetup {
  day: string;
  plan?: DayPlan;
  machinesOk: boolean;
  healthOk: boolean;
}

const today = () => new Date().toDateString();
const blank = (): DaySetup => ({ day: today(), machinesOk: false, healthOk: false });

/** Today's progress on this road, or a fresh start when the saved one is from another day. */
export const setupFor = (byRoad: Record<string, DaySetup>, roadId: string): DaySetup => {
  const s = byRoad[roadId];
  return s && s.day === today() ? s : blank();
};

interface DaySetupState {
  byRoad: Record<string, DaySetup>;
  update: (roadId: string, patch: Partial<Omit<DaySetup, 'day'>>) => void;
  clear: (roadId: string) => void;
}

/** Saved on the phone, so closing the app halfway keeps the steps already done today. */
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
