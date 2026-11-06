import type { Attendance, HealthReport, MaterialLine, Worker } from '../types';

export const worker = (over: Partial<Worker> = {}): Worker => ({
  id: 'w1',
  name: 'Test Worker',
  nameBn: 'পরীক্ষা শ্রমিক',
  color: '#000000',
  post: 'laborer',
  age: 30,
  dailyRate: 600,
  phone: '01700000000',
  ...over,
});

export const present = (over: Partial<Attendance> = {}): Attendance => ({
  workerId: 'w1',
  presentAtStart: true,
  presentAtEnd: true,
  health: 'fit',
  output: 0,
  ...over,
});

export const material = (over: Partial<MaterialLine> = {}): MaterialLine => ({ key: 'sand', allocated: 100, used: 80, wasted: 5, ...over });

let n = 0;
export const report = (workerId: string, status: HealthReport['status'], at: Date): HealthReport => ({
  id: `h${++n}`,
  workerId,
  status,
  note: '',
  at: at.toISOString(),
});

export const day = (d: number, h = 9) => new Date(2026, 10, d, h, 0, 0);
