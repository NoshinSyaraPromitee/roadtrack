import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApaSettings {
  wake: boolean;
  setWake: (on: boolean) => void;
}

export const useApaSettings = create<ApaSettings>()(
  persist(
    (set) => ({
      wake: false,
      setWake: (wake) => set({ wake }),
    }),
    { name: 'roadtrack-v3-apa' },
  ),
);
