import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/core/types';

interface SessionState {
  role: Role | null;
  workerId: string | null;
  login: (role: Role, workerId?: string | null) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      role: null,
      workerId: null,
      login: (role, workerId = null) => set({ role, workerId }),
      logout: () => set({ role: null, workerId: null }),
    }),
    { name: 'roadtrack-session' },
  ),
);