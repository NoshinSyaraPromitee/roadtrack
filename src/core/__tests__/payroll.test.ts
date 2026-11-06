import { describe, expect, it } from 'vitest';
import { applyPayEdits, calculatePayLine, calculatePayroll, PAYROLL_RULES, payrollTotal } from '../payroll';
import { present, worker } from './fixtures';

describe('calculatePayLine', () => {
  it('pays the full daily rate for a full, healthy day', () => {
    const line = calculatePayLine(worker(), present());
    expect(line).toMatchObject({ basePay: 600, deduction: 0, welfareBonus: 0, total: 600, flags: [] });
  });

  it('pays nothing and flags absent when the worker never came', () => {
    const line = calculatePayLine(worker(), present({ presentAtStart: false }));
    expect(line).toMatchObject({ basePay: 0, total: 0, flags: ['absent'] });
  });

  it('cuts the early-leave share when the worker left before the recount', () => {
    const line = calculatePayLine(worker(), present({ presentAtEnd: false }));
    expect(line.deduction).toBe((600 * PAYROLL_RULES.earlyLeaveCutPct) / 100);
    expect(line.total).toBe(300);
    expect(line.flags).toEqual(['left']);
  });

  it('adds the senior bonus from the senior age upwards', () => {
    expect(calculatePayLine(worker({ age: PAYROLL_RULES.seniorAge - 1 }), present()).welfareBonus).toBe(0);
    const line = calculatePayLine(worker({ age: PAYROLL_RULES.seniorAge }), present());
    expect(line.welfareBonus).toBe(90);
    expect(line.flags).toEqual(['senior']);
  });

  it('adds the health bonus for sick or hurt workers', () => {
    expect(calculatePayLine(worker(), present({ health: 'sick' }))).toMatchObject({ welfareBonus: 120, total: 720, flags: ['sick'] });
    expect(calculatePayLine(worker(), present({ health: 'injured' })).flags).toEqual(['injured']);
  });

  it('combines every rule on one line', () => {
    const line = calculatePayLine(worker({ age: 60 }), present({ presentAtEnd: false, health: 'injured' }));
    expect(line).toMatchObject({ deduction: 300, welfareBonus: 210, total: 510, flags: ['left', 'senior', 'injured'] });
  });

  it('rounds money to whole taka', () => {
    const line = calculatePayLine(worker({ dailyRate: 555, age: 55 }), present());
    expect(Number.isInteger(line.welfareBonus)).toBe(true);
    expect(Number.isInteger(line.total)).toBe(true);
  });
});

describe('calculatePayroll and payrollTotal', () => {
  it('skips attendance rows with no matching worker', () => {
    const lines = calculatePayroll([worker()], [present(), present({ workerId: 'ghost' })]);
    expect(lines.map((l) => l.workerId)).toEqual(['w1']);
  });

  it('adds up every line', () => {
    const lines = calculatePayroll([worker(), worker({ id: 'w2', dailyRate: 400 })], [present(), present({ workerId: 'w2' })]);
    expect(payrollTotal(lines)).toBe(1000);
  });
});

describe('applyPayEdits', () => {
  const [line] = calculatePayroll([worker()], [present()]);

  it('leaves lines without an edit untouched', () => {
    expect(applyPayEdits([line], {})[0]).toBe(line);
  });

  it('adds a raise and keeps the trimmed note', () => {
    const [edited] = applyPayEdits([line], { w1: { adjustment: 150, note: '  2 hours extra  ' } });
    expect(edited).toMatchObject({ adjustment: 150, note: '2 hours extra', total: 750 });
  });

  it('never cuts below zero', () => {
    const [edited] = applyPayEdits([line], { w1: { adjustment: -5000, note: 'damage' } });
    expect(edited.total).toBe(0);
    expect(edited.adjustment).toBe(-600);
  });

  it('drops an empty adjustment and an empty note', () => {
    const [edited] = applyPayEdits([line], { w1: { adjustment: 0, note: '   ' } });
    expect(edited.adjustment).toBeUndefined();
    expect(edited.note).toBeUndefined();
    expect(edited.total).toBe(600);
  });
});
