import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReminderSettings {
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

export const useReminderSettings = create<ReminderSettings>()(
  persist(
    (set) => ({
      demoMode: true,
      setDemoMode: (demoMode) => set({ demoMode }),
    }),
    { name: 'roadtrack-v2-reminders' },
  ),
);