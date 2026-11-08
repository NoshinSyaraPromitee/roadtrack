import type { Machine, Repair } from './types';

export const MAX_REPAIR_COST = 10_000_000;

/** Adds a repair to the log. A zero cost (fixed for free, or just serviced) is not logged. */
export function addRepair(log: Repair[] = [], cost: number, at: string): Repair[] {
  const taka = Math.round(cost);
  if (!Number.isFinite(taka) || taka <= 0) return log;
  return [...log, { at, cost: Math.min(taka, MAX_REPAIR_COST) }];
}

export const repairCost = (m: Pick<Machine, 'repairs'>) => (m.repairs ?? []).reduce((total, r) => total + r.cost, 0);

export const repairCostAll = (machines: Pick<Machine, 'repairs'>[]) => machines.reduce((total, m) => total + repairCost(m), 0);

export const lastRepair = (m: Pick<Machine, 'repairs'>): Repair | undefined => m.repairs?.[m.repairs.length - 1];
