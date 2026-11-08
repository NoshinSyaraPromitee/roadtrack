import { describe, expect, it } from 'vitest';
import { LOW_FUEL_PCT, MAX_REPAIR_COST, SERVICE_EVERY_HOURS, addRepair, fuelLow, lastRepair, machineLabel, repairCost, repairCostAll, serviceDue } from '../machines';

const at = '2026-11-08T10:00:00Z';

describe('machine state', () => {
  it('names a machine in both languages', () => {
    expect(machineLabel({ kind: 'roller', code: 'RL-01' })).toEqual({ en: 'Road roller RL-01', bn: 'রোড রোলার RL-01' });
  });

  it('flags low fuel and due service at the limits', () => {
    expect(fuelLow({ fuelPct: LOW_FUEL_PCT - 1 })).toBe(true);
    expect(fuelLow({ fuelPct: LOW_FUEL_PCT })).toBe(false);
    expect(serviceDue({ hoursSinceService: SERVICE_EVERY_HOURS })).toBe(true);
    expect(serviceDue({ hoursSinceService: SERVICE_EVERY_HOURS - 1 })).toBe(false);
  });
});

describe('repairs', () => {
  it('adds a repair with a rounded cost', () => {
    expect(addRepair([], 4500.4, at)).toEqual([{ at, cost: 4500 }]);
  });

  it('skips zero, negative or broken costs', () => {
    const log = [{ at, cost: 100 }];
    expect(addRepair(log, 0, at)).toBe(log);
    expect(addRepair(log, -5, at)).toBe(log);
    expect(addRepair(log, Number.NaN, at)).toBe(log);
  });

  it('caps a mistyped huge cost', () => {
    expect(addRepair(undefined, 1e12, at)[0].cost).toBe(MAX_REPAIR_COST);
  });

  it('totals per machine and per road', () => {
    const a = { repairs: [{ at, cost: 4500 }, { at: '2026-11-09T10:00:00Z', cost: 500 }] };
    const b = { repairs: undefined };
    expect(repairCost(a)).toBe(5000);
    expect(repairCost(b)).toBe(0);
    expect(repairCostAll([a, b, { repairs: [{ at, cost: 1000 }] }])).toBe(6000);
    expect(lastRepair(a)?.cost).toBe(500);
    expect(lastRepair(b)).toBeUndefined();
  });
});
