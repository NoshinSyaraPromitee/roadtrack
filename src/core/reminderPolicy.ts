import type { BreakLog, BreakType } from './types';

export interface BreakPolicy {
  restEveryMin: number;
  snackEveryMin: number;
}

/** Rest every 2 hours, snacks every 4 hours. */
export const BREAK_POLICY: BreakPolicy = { restEveryMin: 120, snackEveryMin: 240 };

export interface BreakStatus {
  due: BreakType | null;
  nextType: BreakType;
  msUntilNext: number;
}

export function getBreakStatus(startedAt: string, breaks: BreakLog[], now: number, policy: BreakPolicy = BREAK_POLICY): BreakStatus {
  const start = new Date(startedAt).getTime();
  const lastOf = (types: BreakType[]) => {
    const b = [...breaks].reverse().find((x) => types.includes(x.type));
    return b ? new Date(b.at).getTime() : start;
  };

  const restDueAt = lastOf(['rest', 'snack']) + policy.restEveryMin * 60_000;
  const snackDueAt = lastOf(['snack']) + policy.snackEveryMin * 60_000;

  if (now >= snackDueAt) return { due: 'snack', nextType: 'snack', msUntilNext: 0 };
  if (now >= restDueAt) return { due: 'rest', nextType: 'rest', msUntilNext: 0 };
  return restDueAt <= snackDueAt
    ? { due: null, nextType: 'rest', msUntilNext: restDueAt - now }
    : { due: null, nextType: 'snack', msUntilNext: snackDueAt - now };
}
