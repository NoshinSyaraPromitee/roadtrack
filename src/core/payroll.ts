import type { Attendance, PayFlag, PayrollLine, Worker } from './types';

export const PAYROLL_RULES = {
  seniorAge: 50,
  seniorBonusPct: 15,
  healthBonusPct: 20,
  earlyLeaveCutPct: 50,
} as const;

export function calculatePayLine(worker: Worker, a: Attendance): PayrollLine {
  if (!a.presentAtStart) {
    return { workerId: worker.id, basePay: 0, deduction: 0, welfareBonus: 0, total: 0, flags: ['absent'] };
  }

  const flags: PayFlag[] = [];
  const basePay = worker.dailyRate;

  const deduction = a.presentAtEnd ? 0 : (basePay * PAYROLL_RULES.earlyLeaveCutPct) / 100;
  if (!a.presentAtEnd) flags.push('left');

  let welfareBonus = 0;
  if (worker.age >= PAYROLL_RULES.seniorAge) {
    welfareBonus += (basePay * PAYROLL_RULES.seniorBonusPct) / 100;
    flags.push('senior');
  }
  if (a.health !== 'fit') {
    welfareBonus += (basePay * PAYROLL_RULES.healthBonusPct) / 100;
    flags.push(a.health);
  }

  return {
    workerId: worker.id,
    basePay,
    deduction: Math.round(deduction),
    welfareBonus: Math.round(welfareBonus),
    total: Math.round(basePay - deduction + welfareBonus),
    flags,
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

export interface PayEdit {
  adjustment: number;
  note: string;
}

export function applyPayEdits(lines: PayrollLine[], edits: Record<string, PayEdit>): PayrollLine[] {
  return lines.map((l) => {
    const e = edits[l.workerId];
    if (!e) return l;
    const worked = l.basePay - l.deduction + l.welfareBonus;
    const adjustment = Math.max(e.adjustment, -worked);
    return { ...l, adjustment: adjustment || undefined, note: e.note.trim() || undefined, total: Math.max(0, worked + adjustment) };
  });
}
