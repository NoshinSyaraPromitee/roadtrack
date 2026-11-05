import type { Attendance, PayrollLine, Worker } from './types';

export const PAYROLL_RULES = {
  seniorAge: 50,
  seniorBonusPct: 15,
  healthBonusPct: 20,
  earlyLeaveCutPct: 50,
} as const;

export function calculatePayLine(worker: Worker, a: Attendance): PayrollLine {
  const base = { workerId: worker.id, name: worker.name, post: worker.post };
  if (!a.presentAtStart) {
    return { ...base, basePay: 0, deduction: 0, welfareBonus: 0, total: 0, notes: ['Absent'] };
  }

  const notes: string[] = [];
  const basePay = worker.dailyRate;

  const deduction = a.presentAtEnd ? 0 : (basePay * PAYROLL_RULES.earlyLeaveCutPct) / 100;
  if (!a.presentAtEnd) notes.push(`Missing at recount -${PAYROLL_RULES.earlyLeaveCutPct}%`);

  let welfareBonus = 0;
  if (worker.age >= PAYROLL_RULES.seniorAge) {
    welfareBonus += (basePay * PAYROLL_RULES.seniorBonusPct) / 100;
    notes.push(`Senior (${worker.age}) +${PAYROLL_RULES.seniorBonusPct}%`);
  }
  if (a.health !== 'fit') {
    welfareBonus += (basePay * PAYROLL_RULES.healthBonusPct) / 100;
    notes.push(`${a.health === 'sick' ? 'Sick' : 'Injured'} support +${PAYROLL_RULES.healthBonusPct}%`);
  }

  return {
    ...base,
    basePay,
    deduction: Math.round(deduction),
    welfareBonus: Math.round(welfareBonus),
    total: Math.round(basePay - deduction + welfareBonus),
    notes,
  };
}

export function calculatePayroll(workers: Worker[], attendance: Attendance[]): PayrollLine[] {
  const lines: PayrollLine[] = [];
  for (const a of attendance) {
    const worker = workers.find((w) => w.id === a.workerId);
    if (worker) lines.push(calculatePayLine(worker, a));
  }
  return lines;
}

export const payrollTotal = (lines: PayrollLine[]) => lines.reduce((s, l) => s + l.total, 0);