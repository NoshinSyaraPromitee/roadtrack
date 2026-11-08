import { describe, expect, it } from 'vitest';
import { sickDays, todaysReport, todaysReports } from '../health';
import { day, report } from './fixtures';

const NOW = day(20, 12);

describe('sickDays', () => {
  it('is zero with no reports', () => {
    expect(sickDays([], 'w1', NOW)).toEqual({ streak: 0, month: 0 });
  });

  it('counts consecutive unwell days up to today', () => {
    const r = [report('w1', 'sick', day(18)), report('w1', 'sick', day(19)), report('w1', 'injured', day(20))];
    expect(sickDays(r, 'w1', NOW).streak).toBe(3);
  });

  it('stops the streak at the last day the worker was well', () => {
    const r = [report('w1', 'sick', day(17)), report('w1', 'fit', day(18)), report('w1', 'sick', day(20))];
    expect(sickDays(r, 'w1', NOW).streak).toBe(1);
  });

  it('has no streak when the worker is well today', () => {
    const r = [report('w1', 'sick', day(19)), report('w1', 'fit', day(20))];
    expect(sickDays(r, 'w1', NOW).streak).toBe(0);
  });

  it('has no streak when the last sick report is old', () => {
    expect(sickDays([report('w1', 'sick', day(15))], 'w1', NOW).streak).toBe(0);
  });

  it('uses the latest report of each day', () => {
    const r = [report('w1', 'sick', day(20, 7)), report('w1', 'fit', day(20, 15))];
    expect(sickDays(r, 'w1', NOW)).toEqual({ streak: 0, month: 0 });
  });

  it('counts unwell days in the last 30 days only', () => {
    const old = new Date(2026, 9, 1, 9);
    const r = [report('w1', 'sick', old), report('w1', 'sick', day(5)), report('w1', 'sick', day(10)), report('w1', 'fit', day(12))];
    expect(sickDays(r, 'w1', NOW).month).toBe(2);
  });

  it('ignores other workers', () => {
    expect(sickDays([report('w2', 'sick', day(20))], 'w1', NOW)).toEqual({ streak: 0, month: 0 });
  });
});

describe('todaysReports', () => {
  const reports = [report('w1', 'sick', day(7, 8)), report('w1', 'fit', day(8, 7)), report('w1', 'sick', day(8, 11)), report('w2', 'fit', day(8, 9))];

  it('keeps only the latest report per worker from today', () => {
    expect(todaysReports(reports, day(8, 18)).map((r) => [r.workerId, r.status])).toEqual([
      ['w1', 'sick'],
      ['w2', 'fit'],
    ]);
  });

  it('ignores earlier days', () => {
    expect(todaysReport(reports, 'w1', day(9, 9))).toBeUndefined();
  });
});
