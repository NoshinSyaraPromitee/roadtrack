import { describe, expect, it } from 'vitest';
import { MAX_REPAIR_COST, addRepair, lastRepair, repairCost, repairCostAll } from '../repairs';

const at = '2026-11-08T10:00:00Z';

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
