import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROADS, roadById } from '@/core/roads';

interface RoadState {
  roadId: string;
  setRoad: (id: string) => void;
}

export const useRoadStore = create<RoadState>()(
  persist(
    (set) => ({
      roadId: ROADS[0].id,
      setRoad: (roadId) => set({ roadId }),
    }),
    { name: 'roadtrack-v3-road' },
  ),
);

/** The road everyone on this device is working on. */
export const useRoad = () => roadById(useRoadStore((s) => s.roadId));
