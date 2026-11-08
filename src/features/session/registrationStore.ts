import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Registration } from '@/core/registrations';
import { approvedAccounts } from '@/core/registrations';

interface RegistrationState {
  list: Registration[];
  add: (r: Registration) => void;
  decide: (id: string, status: 'approved' | 'rejected') => void;
}

export const useRegistrations = create<RegistrationState>()(
  persist(
    (set) => ({
      list: [],
      add: (r) => set((s) => ({ list: [r, ...s.list] })),
      decide: (id, status) => set((s) => ({ list: s.list.map((r) => (r.id === id ? { ...r, status, decidedAt: new Date().toISOString() } : r)) })),
    }),
    { name: 'roadtrack-v4-registrations' },
  ),
);

export function useApprovedAccounts() {
  const list = useRegistrations((s) => s.list);
  return useMemo(() => approvedAccounts(list), [list]);
}

export const usePendingRegistrations = () => useRegistrations((s) => s.list.filter((r) => r.status === 'pending').length);

export const useContractor = (accountId: string | null) =>
  useRegistrations((s) => (accountId ? s.list.find((r) => r.id === accountId && r.status === 'approved') : undefined));
