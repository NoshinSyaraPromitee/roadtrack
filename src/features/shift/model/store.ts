import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attendance, BreakType, MaterialLine, Shift, Worker } from '@/core/types';
import { calculatePayroll } from '@/core/payroll';
import { PROJECT, SEED_SHIFTS } from '@/core/seed';
import { uid } from '@/shared/lib/utils';

export interface StartShiftInput {
  site: string;
  startProgress: number;
  workerIds: string[];
  materials: Array<Pick<MaterialLine, 'name' | 'unit' | 'allocated'>>;
}

export interface EndShiftInput {
  attendance: Attendance[];
  materials: MaterialLine[];
  endProgress: number;
  incidents: string;
}

interface ShiftState {
  shifts: Shift[];
  startShift: (input: StartShiftInput) => void;
  logBreak: (type: BreakType) => void;
  endShift: (input: EndShiftInput, workers: Worker[]) => string | null;
  approvePayroll: (id: string) => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: SEED_SHIFTS,

      startShift: (input) => {
        const shift: Shift = {
          id: uid('s'),
          site: input.site,
          supervisor: PROJECT.supervisor,
          startedAt: new Date().toISOString(),
          status: 'active',
          startProgress: input.startProgress,
          attendance: input.workerIds.map((workerId): Attendance => ({ workerId, presentAtStart: true, presentAtEnd: true, health: 'fit', output: 0 })),
          materials: input.materials.map((m) => ({ ...m, used: 0, wasted: 0 })),
          breaks: [],
          incidents: '',
          payroll: [],
        };
        set((s) => ({ shifts: [...s.shifts, shift] }));
      },

      logBreak: (type) =>
        set((s) => ({
          shifts: s.shifts.map((sh): Shift =>
            sh.status === 'active' ? { ...sh, breaks: [...sh.breaks, { id: uid('b'), type, at: new Date().toISOString() }] } : sh,
          ),
        })),

      endShift: (input, workers) => {
        const active = get().shifts.find((s) => s.status === 'active');
        if (!active) return null;
        const done: Shift = {
          ...active,
          ...input,
          status: 'completed',
          endedAt: new Date().toISOString(),
          payroll: calculatePayroll(workers, input.attendance),
          payrollStatus: 'pending',
        };
        set((s) => ({ shifts: s.shifts.map((sh) => (sh.id === active.id ? done : sh)) }));
        return active.id;
      },

      approvePayroll: (id) =>
        set((s) => ({ shifts: s.shifts.map((sh): Shift => (sh.id === id ? { ...sh, payrollStatus: 'approved' } : sh)) })),
    }),
    { name: 'roadtrack-shifts' },
  ),
);