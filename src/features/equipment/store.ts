import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Machine, MachineStatus } from '@/core/types';
import { addRepair } from '@/core/machines';
import { SEED_MACHINES } from '@/data/seed';

interface EquipmentState {
  machines: Machine[];
  update: (id: string, patch: Partial<Pick<Machine, 'status' | 'fuelPct' | 'hoursToday' | 'operatorId'>>) => void;
  serviced: (id: string, cost: number) => void;
}

const stamp = () => new Date().toISOString();

export const useEquipment = create<EquipmentState>()(
  persist(
    (set) => ({
      machines: SEED_MACHINES,
      update: (id, patch) =>
        set((s) => ({
          machines: s.machines.map((m) => {
            if (m.id !== id) return m;
            const added = patch.hoursToday !== undefined ? patch.hoursToday - m.hoursToday : 0;
            return { ...m, ...patch, hoursSinceService: Math.max(0, m.hoursSinceService + added), updatedAt: stamp() };
          }),
        })),
      serviced: (id, cost) =>
        set((s) => ({
          machines: s.machines.map((m) => (m.id === id ? { ...m, hoursSinceService: 0, status: 'idle' as MachineStatus, updatedAt: stamp(), repairs: addRepair(m.repairs, cost, stamp()) } : m)),
        })),
    }),
    {
      name: 'roadtrack-v3-equipment',
      version: 1,
      migrate: (saved) => {
        const state = saved as Partial<EquipmentState>;
        const seedRepairs = (id: string) => SEED_MACHINES.find((m) => m.id === id)?.repairs;
        const machines = (state.machines ?? SEED_MACHINES).map((m) => ({ ...m, repairs: m.repairs ?? seedRepairs(m.id) }));
        return { ...state, machines } as EquipmentState;
      },
    },
  ),
);
