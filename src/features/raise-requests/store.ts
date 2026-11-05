import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RaiseRequest, RaiseStatus } from '@/core/types';
import { SEED_RAISES } from '@/core/seed';
import { uid } from '@/shared/lib/utils';

export type NewRaise = Omit<RaiseRequest, 'id' | 'createdAt' | 'status'>;

interface RaiseState {
  requests: RaiseRequest[];
  request: (r: NewRaise) => void;
  decide: (id: string, status: Exclude<RaiseStatus, 'pending'>) => void;
}

export const useRaiseRequests = create<RaiseState>()(
  persist(
    (set) => ({
      requests: SEED_RAISES,
      request: (r) => set((s) => ({ requests: [...s.requests, { ...r, id: uid('r'), createdAt: new Date().toISOString(), status: 'pending' }] })),
      decide: (id, status) => set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
    }),
    { name: 'roadtrack-v2-raises' },
  ),
);