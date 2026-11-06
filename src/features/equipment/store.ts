import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Machine, MachineStatus } from '@/core/types';
import { SEED_MACHINES } from '@/core/seed';

interface EquipmentState {
  machines: Machine[];
  update: (id: string, patch: Partial<Pick<Machine, 'status' | 'fuelPct' | 'hoursToday' | 'operatorId'>>) => void;
  serviced: (id: string) => void;
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
      serviced: (id) => set((s) => ({ machines: s.machines.map((m) => (m.id === id ? { ...m, hoursSinceService: 0, status: 'idle' as MachineStatus, updatedAt: stamp() } : m)) })),
    }),
    { name: 'roadtrack-v3-equipment' },
  ),
);
