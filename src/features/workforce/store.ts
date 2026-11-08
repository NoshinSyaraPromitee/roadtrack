import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker } from '@/core/types';
import { SEED_WORKERS } from '@/data/seed';

interface WorkforceState {
  workers: Worker[];
  updateRate: (id: string, rate: number) => void;
}

export const useWorkforce = create<WorkforceState>()(
  persist(
    (set) => ({
      workers: SEED_WORKERS,
      updateRate: (id, rate) => set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, dailyRate: rate } : w)) })),
    }),
    {
      name: 'roadtrack-v3-workforce',
      version: 1,
      migrate: (saved) => {
        const state = saved as Partial<WorkforceState>;
        const seedPhoto = (id: string) => SEED_WORKERS.find((s) => s.id === id)?.photo;
        const workers = (state.workers ?? SEED_WORKERS).map((w) => ({ ...w, photo: w.photo ?? seedPhoto(w.id) }));
        return { ...state, workers } as WorkforceState;
      },
    },
  ),
);

export const useWorker = (id: string | null) => useWorkforce((s) => s.workers.find((w) => w.id === id));
