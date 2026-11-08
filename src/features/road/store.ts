import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Road } from '@/core/types';
import { ROADS, roadById } from '@/core/roads';

interface RoadState {
  roadId: string;
  custom: Road[];
  setRoad: (id: string) => void;
  addRoad: (road: Road) => void;
  removeRoad: (id: string) => void;
}

export const useRoadStore = create<RoadState>()(
  persist(
    (set) => ({
      roadId: ROADS[0].id,
      custom: [],
      setRoad: (roadId) => set({ roadId }),
      addRoad: (road) => set((s) => ({ custom: [...s.custom, road], roadId: road.id })),
      removeRoad: (id) => set((s) => ({ custom: s.custom.filter((r) => r.id !== id), roadId: s.roadId === id ? ROADS[0].id : s.roadId })),
    }),
    { name: 'roadtrack-v3-road' },
  ),
);

export function useRoads(): Road[] {
  const custom = useRoadStore((s) => s.custom);
  return useMemo(() => [...ROADS, ...custom], [custom]);
}

export function useRoad(): Road {
  const roadId = useRoadStore((s) => s.roadId);
  const roads = useRoads();
  return roadById(roadId, roads);
}
