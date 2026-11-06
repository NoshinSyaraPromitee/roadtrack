import { describe, expect, it } from 'vitest';
import type { BreakLog } from '../types';
import { BREAK_POLICY, getBreakStatus } from '../reminderPolicy';

const START = new Date(2026, 10, 7, 8, 0).getTime();
const iso = (min: number) => new Date(START + min * 60_000).toISOString();
const at = (min: number) => START + min * 60_000;
const log = (type: BreakLog['type'], min: number): BreakLog => ({ id: `${type}${min}`, type, at: iso(min) });

describe('getBreakStatus', () => {
  it('counts down to the first rest at the start of a shift', () => {
    const s = getBreakStatus(iso(0), [], at(0));
    expect(s).toEqual({ due: null, nextType: 'rest', msUntilNext: BREAK_POLICY.restEveryMin * 60_000 });
  });

  it('says rest is due once the rest gap has passed', () => {
    expect(getBreakStatus(iso(0), [], at(BREAK_POLICY.restEveryMin)).due).toBe('rest');
  });

  it('restarts the rest timer after a rest is logged', () => {
    const s = getBreakStatus(iso(0), [log('rest', 120)], at(150));
    expect(s.due).toBeNull();
    expect(s.msUntilNext).toBe(90 * 60_000);
  });

  it('puts snack ahead of rest when both are due', () => {
    expect(getBreakStatus(iso(0), [log('rest', 120)], at(240)).due).toBe('snack');
  });

  it('treats a snack as a rest too', () => {
    const s = getBreakStatus(iso(0), [log('snack', 240)], at(300));
    expect(s).toMatchObject({ due: null, nextType: 'rest', msUntilNext: 60 * 60_000 });
  });

  it('uses a custom policy when given one', () => {
    const s = getBreakStatus(iso(0), [], at(30), { restEveryMin: 30, snackEveryMin: 90 });
    expect(s.due).toBe('rest');
  });
});
