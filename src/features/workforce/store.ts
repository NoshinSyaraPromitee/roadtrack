import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Person, Worker } from '@/core/types';
import { SEED_WORKERS, SUPERVISOR } from '@/core/seed';

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
    { name: 'roadtrack-v2-workforce' },
  ),
);

export const useWorker = (id: string | null) => useWorkforce((s) => s.workers.find((w) => w.id === id));

/** The supervisor or a worker, looked up by id. */
export const usePerson = (id: string | null): Person | undefined =>
  useWorkforce((s) => (id === SUPERVISOR.id ? SUPERVISOR : s.workers.find((w) => w.id === id)));