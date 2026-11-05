import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker } from '@/core/types';
import { SEED_WORKERS } from '@/core/seed';

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
    { name: 'roadtrack-workforce' },
  ),
);

export const useWorker = (id: string | null) => useWorkforce((s) => s.workers.find((w) => w.id === id));