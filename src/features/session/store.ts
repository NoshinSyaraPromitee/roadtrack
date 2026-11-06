import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/core/types';

interface SessionState {
  role: Role | null;
  workerId: string | null;
  accountId: string | null;
  login: (role: Role, ids?: { workerId?: string | null; accountId?: string | null }) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      role: null,
      workerId: null,
      accountId: null,
      login: (role, ids = {}) => set({ role, workerId: ids.workerId ?? null, accountId: ids.accountId ?? null }),
      logout: () => set({ role: null, workerId: null, accountId: null }),
    }),
    { name: 'roadtrack-v3-session' },
  ),
);
