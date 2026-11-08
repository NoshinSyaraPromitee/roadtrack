import { useMemo } from 'react';
import type { Shift } from '@/core/types';
import { useRoadStore, useRoads } from '@/features/road';
import { useShiftStore } from './store';

const byStart = (a: Shift, b: Shift) => a.startedAt.localeCompare(b.startedAt);

export const useActiveShift = () => {
  const roadId = useRoadStore((s) => s.roadId);
  return useShiftStore((s) => s.shifts.find((sh) => sh.status === 'active' && sh.roadId === roadId));
};

export const useShiftById = (id: string | null) => useShiftStore((s) => s.shifts.find((sh) => sh.id === id));

export function useCompletedShifts() {
  const shifts = useShiftStore((s) => s.shifts);
  const roadId = useRoadStore((s) => s.roadId);
  return useMemo(() => shifts.filter((s) => s.status === 'completed' && s.roadId === roadId).sort(byStart), [shifts, roadId]);
}

export function useAllCompletedShifts() {
  const shifts = useShiftStore((s) => s.shifts);
  return useMemo(() => shifts.filter((s) => s.status === 'completed').sort(byStart), [shifts]);
}

const progressOf = (shifts: Shift[], roadId: string) => {
  const done = shifts.filter((s) => s.status === 'completed' && s.roadId === roadId).sort(byStart);
  return done.length ? (done[done.length - 1].endProgress ?? 0) : 0;
};

export function useProjectProgress() {
  const shifts = useShiftStore((s) => s.shifts);
  const roadId = useRoadStore((s) => s.roadId);
  return useMemo(() => progressOf(shifts, roadId), [shifts, roadId]);
}

export function useRoadProgressMap() {
  const shifts = useShiftStore((s) => s.shifts);
  const roads = useRoads();
  return useMemo(() => Object.fromEntries(roads.map((r) => [r.id, progressOf(shifts, r.id)])), [shifts, roads]);
}
