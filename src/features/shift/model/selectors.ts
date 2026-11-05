import { useMemo } from 'react';
import { useShiftStore } from './store';

export const useActiveShift = () => useShiftStore((s) => s.shifts.find((sh) => sh.status === 'active'));

export const useShiftById = (id: string | null) => useShiftStore((s) => s.shifts.find((sh) => sh.id === id));

export function useCompletedShifts() {
  const shifts = useShiftStore((s) => s.shifts);
  return useMemo(() => shifts.filter((s) => s.status === 'completed').sort((a, b) => a.startedAt.localeCompare(b.startedAt)), [shifts]);
}

export function useProjectProgress() {
  const completed = useCompletedShifts();
  return completed.length ? (completed[completed.length - 1].endProgress ?? 0) : 0;
}