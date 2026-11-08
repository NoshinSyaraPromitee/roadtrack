import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PasswordState {
  changed: Record<string, string>;
  setHash: (accountId: string, hash: string) => void;
}

export const usePasswords = create<PasswordState>()(
  persist(
    (set) => ({
      changed: {},
      setHash: (accountId, hash) => set((s) => ({ changed: { ...s.changed, [accountId]: hash } })),
    }),
    { name: 'roadtrack-v4-passwords' },
  ),
);

export const RESET_CODE_MS = 5 * 60_000;
export const RESET_TRIES = 3;

export function newResetCode() {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, '0');
}
