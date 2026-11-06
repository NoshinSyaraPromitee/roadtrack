import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attendance, BreakType, IncidentKey, MaterialKey, MaterialLine, Shift, Text, Worker } from '@/core/types';
import { applyPayEdits, calculatePayroll } from '@/core/payroll';
import type { PayEdit } from '@/core/payroll';
import { SEED_SHIFTS } from '@/core/seed';
import { uid } from '@/shared/lib/utils';

export interface StartShiftInput {
  roadId: string;
  site: Text;
  startProgress: number;
  workerIds: string[];
  materials: Array<{ key: MaterialKey; allocated: number }>;
}

export interface EndShiftInput {
  attendance: Attendance[];
  materials: MaterialLine[];
  endProgress: number;
  incidentTags: IncidentKey[];
  incidents: string;
  photos?: string[];
  /** The supervisor's changes to the pay list, by worker. */
  payEdits?: Record<string, PayEdit>;
}

interface ShiftState {
  shifts: Shift[];
  startShift: (input: StartShiftInput) => void;
  logBreak: (roadId: string, type: BreakType) => void;
  endShift: (roadId: string, input: EndShiftInput, workers: Worker[]) => string | null;
  approvePayroll: (id: string) => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: SEED_SHIFTS,

      startShift: (input) => {
        const shift: Shift = {
          id: uid('s'),
          roadId: input.roadId,
          site: input.site,
          startedAt: new Date().toISOString(),
          status: 'active',
          startProgress: input.startProgress,
          attendance: input.workerIds.map((workerId) => ({ workerId, presentAtStart: true, presentAtEnd: true, health: 'fit', output: 0 })),
          materials: input.materials.map((m) => ({ ...m, used: 0, wasted: 0 })),
          breaks: [],
          incidentTags: [],
          incidents: '',
          payroll: [],
        };
        set((s) => ({ shifts: [...s.shifts, shift] }));
      },

      logBreak: (roadId, type) =>
        set((s) => ({
          shifts: s.shifts.map((sh): Shift =>
            sh.status === 'active' && sh.roadId === roadId ? { ...sh, breaks: [...sh.breaks, { id: uid('b'), type, at: new Date().toISOString() }] } : sh,
          ),
        })),

      endShift: (roadId, input, workers) => {
        const active = get().shifts.find((s) => s.status === 'active' && s.roadId === roadId);
        if (!active) return null;
        const { payEdits = {}, ...rest } = input;
        const done: Shift = {
          ...active,
          ...rest,
          status: 'completed',
          endedAt: new Date().toISOString(),
          payroll: applyPayEdits(calculatePayroll(workers, input.attendance), payEdits),
          payrollStatus: 'pending',
        };
        set((s) => ({ shifts: s.shifts.map((sh) => (sh.id === active.id ? done : sh)) }));
        return active.id;
      },

      approvePayroll: (id) => set((s) => ({ shifts: s.shifts.map((sh): Shift => (sh.id === id ? { ...sh, payrollStatus: 'approved' } : sh)) })),
    }),
    { name: 'roadtrack-v4-shifts' },
  ),
);
