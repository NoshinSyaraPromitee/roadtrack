import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceGuideState {
  on: boolean;
  toggle: () => void;
}

export const useVoiceGuide = create<VoiceGuideState>()(
  persist(
    (set) => ({
      on: true,
      toggle: () => set((s) => ({ on: !s.on })),
    }),
    { name: 'roadtrack-v3-voice' },
  ),
);
