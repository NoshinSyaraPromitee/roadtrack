import type { Attendance, BreakLog, Complaint, Health, MaterialLine, Project, RaiseRequest, Shift, Worker } from './types';
import { calculatePayroll } from './payroll';

export const PROJECT: Project = {
  name: 'Tongi-Gazipur Link Road',
  section: 'Section 3 | Chainage 0+000 to 4+200',
  lengthKm: 4.2,
  supervisor: 'Engr. Tanvir Rahman',
};

export interface CatalogItem {
  name: string;
  unit: string;
  defaultQty: number;
}

export const MATERIAL_CATALOG: CatalogItem[] = [
  { name: 'Bitumen', unit: 'drum', defaultQty: 12 },
  { name: 'Stone chips', unit: 'cft', defaultQty: 800 },
  { name: 'Sand', unit: 'cft', defaultQty: 500 },
  { name: 'Cement', unit: 'bag', defaultQty: 60 },
  { name: 'Diesel', unit: 'litre', defaultQty: 150 },
];

export const SEED_WORKERS: Worker[] = [
  { id: 'w1', name: 'Abdul Karim', post: 'Foreman', age: 52, dailyRate: 1200, phone: '01711-000001' },
  { id: 'w2', name: 'Rahim Uddin', post: 'Mason', age: 34, dailyRate: 950, phone: '01711-000002' },
  { id: 'w3', name: 'Jamal Hossain', post: 'Machine Operator', age: 41, dailyRate: 1100, phone: '01711-000003' },
  { id: 'w4', name: 'Shafiq Mia', post: 'Laborer', age: 58, dailyRate: 700, phone: '01711-000004' },
  { id: 'w5', name: 'Rubel Ahmed', post: 'Roller Driver', age: 29, dailyRate: 1000, phone: '01711-000005' },
  { id: 'w6', name: 'Halima Begum', post: 'Laborer', age: 45, dailyRate: 700, phone: '01711-000006' },
  { id: 'w7', name: 'Sumon Das', post: 'Helper', age: 22, dailyRate: 600, phone: '01711-000007' },
  { id: 'w8', name: 'Nurul Islam', post: 'Mason', age: 55, dailyRate: 950, phone: '01711-000008' },
];

const at = (daysBack: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const GAINS = [1.4, 1.8, 1.1, 2.0, 1.6, 1.7];

function seedShift(i: number, startProgress: number): Shift {
  const daysBack = GAINS.length - i;

  const attendance: Attendance[] = SEED_WORKERS.map((_w, idx) => {
    const absent = (idx + i) % 7 === 3;
    const health: Health = (idx * 3 + i) % 11 === 0 ? 'sick' : 'fit';
    return {
      workerId: SEED_WORKERS[idx].id,
      presentAtStart: !absent,
      presentAtEnd: !absent,
      health: absent ? 'fit' : health,
      output: absent ? 0 : 20 + ((idx * 7 + i * 5) % 25),
    };
  });

  const materials: MaterialLine[] = MATERIAL_CATALOG.map((m, idx) => ({
    name: m.name,
    unit: m.unit,
    allocated: m.defaultQty,
    used: Math.round(m.defaultQty * (0.78 + ((i + idx) % 4) * 0.05)),
    wasted: Math.round(m.defaultQty * (0.01 + ((i * 2 + idx) % 3) * 0.015)),
  }));

  const breaks: BreakLog[] = [
    { id: `b_${i}_1`, type: 'rest', at: at(daysBack, 10, 30) },
    { id: `b_${i}_2`, type: 'snack', at: at(daysBack, 13) },
    { id: `b_${i}_3`, type: 'rest', at: at(daysBack, 15, 30) },
  ];

  return {
    id: `s_seed_${i}`,
    site: 'Chainage 1+800 to 2+400',
    supervisor: PROJECT.supervisor,
    startedAt: at(daysBack, 8),
    endedAt: at(daysBack, 17),
    status: 'completed',
    startProgress,
    endProgress: Math.round((startProgress + GAINS[i]) * 10) / 10,
    attendance,
    materials,
    breaks,
    incidents: i === 3 ? 'Minor bitumen spill near chainage 2+100. Area cleaned, no injuries.' : '',
    payroll: calculatePayroll(SEED_WORKERS, attendance),
    payrollStatus: i < GAINS.length - 1 ? 'approved' : 'pending',
  };
}

export const SEED_SHIFTS: Shift[] = GAINS.reduce<Shift[]>((list, _gain, i) => {
  const prev = list[list.length - 1];
  return [...list, seedShift(i, prev?.endProgress ?? 36)];
}, []);

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    fromWorkerId: 'w5',
    anonymous: false,
    against: `${PROJECT.supervisor} (Supervisor)`,
    category: 'Payment',
    message: 'Snacks were not given on Tuesday even though we worked past 6 PM.',
    createdAt: at(2, 18),
    status: 'reviewing',
  },
  {
    id: 'c2',
    fromWorkerId: 'w7',
    anonymous: true,
    against: 'Rubel Ahmed (Roller Driver)',
    category: 'Safety',
    message: 'Operating the roller without a helmet very close to other workers.',
    createdAt: at(1, 17),
    status: 'open',
  },
];

export const SEED_RAISES: RaiseRequest[] = [
  {
    id: 'r1',
    workerId: 'w2',
    currentRate: 950,
    requestedRate: 1050,
    reason: 'Additional responsibility',
    details: 'Training two new masons on curb work for the past month.',
    createdAt: at(3, 19),
    status: 'pending',
  },
];