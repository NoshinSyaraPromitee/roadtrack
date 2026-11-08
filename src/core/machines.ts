import type { Machine, MachineKind, Repair, Text } from './types';

export const SERVICE_EVERY_HOURS = 250;
export const LOW_FUEL_PCT = 25;
export const MAX_REPAIR_COST = 10_000_000;

export const MACHINE_NAMES: Record<MachineKind, Text> = {
  roller: { en: 'Road roller', bn: 'রোড রোলার' },
  excavator: { en: 'Excavator', bn: 'এক্সকাভেটর' },
  paver: { en: 'Paver', bn: 'পেভার' },
  mixer: { en: 'Concrete mixer', bn: 'মিক্সার মেশিন' },
  truck: { en: 'Dump truck', bn: 'ডাম্প ট্রাক' },
  generator: { en: 'Generator', bn: 'জেনারেটর' },
};

export const machineLabel = (m: Pick<Machine, 'kind' | 'code'>): Text => ({
  en: `${MACHINE_NAMES[m.kind].en} ${m.code}`,
  bn: `${MACHINE_NAMES[m.kind].bn} ${m.code}`,
});

export const fuelLow = (m: Pick<Machine, 'fuelPct'>) => m.fuelPct < LOW_FUEL_PCT;
export const serviceDue = (m: Pick<Machine, 'hoursSinceService'>) => m.hoursSinceService >= SERVICE_EVERY_HOURS;
export const isBroken = (m: Pick<Machine, 'status'>) => m.status === 'repair';

/** Adds a repair to the log. A zero cost (fixed for free, or just serviced) is not logged. */
export function addRepair(log: Repair[] = [], cost: number, at: string): Repair[] {
  const taka = Math.round(cost);
  if (!Number.isFinite(taka) || taka <= 0) return log;
  return [...log, { at, cost: Math.min(taka, MAX_REPAIR_COST) }];
}

export const repairCost = (m: Pick<Machine, 'repairs'>) => (m.repairs ?? []).reduce((total, r) => total + r.cost, 0);

export const repairCostAll = (machines: Pick<Machine, 'repairs'>[]) => machines.reduce((total, m) => total + repairCost(m), 0);

export const lastRepair = (m: Pick<Machine, 'repairs'>): Repair | undefined => m.repairs?.[m.repairs.length - 1];
