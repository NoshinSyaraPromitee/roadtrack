import type { Attendance, BreakLog, Complaint, Health, HealthReport, Machine, MaterialLine, Person, RaiseRequest, Road, Shift, Worker } from './types';
import { MATERIALS } from './catalog';
import { calculatePayroll } from './payroll';
import { ROADS } from './roads';

export const SUPERVISOR: Person = {
  id: 'supervisor',
  name: 'Engr. Tanvir Rahman',
  nameBn: 'প্রকৌ. তানভীর রহমান',
  color: '#2c3330',
};

export const SEED_WORKERS: Worker[] = [
  {
    id: 'w1', name: 'Abdul Karim', nameBn: 'আব্দুল করিম', post: 'foreman', age: 52, dailyRate: 1200, phone: '01711-000001',
    color: '#2f6fb2',
  },
  {
    id: 'w2', name: 'Rahim Uddin', nameBn: 'রহিম উদ্দিন', post: 'mason', age: 34, dailyRate: 950, phone: '01711-000002',
    color: '#b83a3a',
  },
  {
    id: 'w3', name: 'Jamal Hossain', nameBn: 'জামাল হোসেন', post: 'operator', age: 41, dailyRate: 1100, phone: '01711-000003',
    color: '#c95f12',
  },
  {
    id: 'w4', name: 'Shafiq Mia', nameBn: 'শফিক মিয়া', post: 'laborer', age: 58, dailyRate: 700, phone: '01711-000004',
    color: '#3f7d31',
  },
  {
    id: 'w5', name: 'Rubel Ahmed', nameBn: 'রুবেল আহমেদ', post: 'roller', age: 29, dailyRate: 1000, phone: '01711-000005',
    color: '#8f6c00',
  },
  {
    id: 'w6', name: 'Halima Begum', nameBn: 'হালিমা বেগম', post: 'laborer', age: 45, dailyRate: 700, phone: '01711-000006',
    color: '#7b3f98',
  },
  {
    id: 'w7', name: 'Sumon Das', nameBn: 'সুমন দাস', post: 'helper', age: 22, dailyRate: 600, phone: '01711-000007',
    color: '#137a79',
  },
  {
    id: 'w8', name: 'Nurul Islam', nameBn: 'নুরুল ইসলাম', post: 'mason', age: 55, dailyRate: 950, phone: '01711-000008',
    color: '#7a5230',
  },
];

const at = (daysBack: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

interface RoadPlan {
  road: Road;
  start: number;
  gains: number[];
  /** Days between the last shift and today. */
  lastDaysBack: number;
}

function seedShift(plan: RoadPlan, i: number, startProgress: number): Shift {
  const { road, gains } = plan;
  const daysBack = gains.length - i + plan.lastDaysBack - 1;
  const seed = road.id.charCodeAt(1);

  const attendance: Attendance[] = SEED_WORKERS.map((w, idx) => {
    const absent = (idx + i + seed) % 7 === 3;
    const health: Health = (idx * 3 + i + seed) % 11 === 0 ? 'sick' : 'fit';
    return {
      workerId: w.id,
      presentAtStart: !absent,
      presentAtEnd: !absent,
      health: absent ? 'fit' : health,
      output: absent ? 0 : 20 + ((idx * 7 + i * 5) % 25),
    };
  });

  const materials: MaterialLine[] = MATERIALS.map((m, idx) => ({
    key: m.key,
    allocated: m.defaultQty,
    used: Math.round(m.defaultQty * (0.78 + ((i + idx) % 4) * 0.05)),
    wasted: Math.round(m.defaultQty * (0.01 + ((i * 2 + idx + seed) % 3) * 0.015)),
  }));

  const breaks: BreakLog[] = [
    { id: `b_${road.id}_${i}_1`, type: 'rest', at: at(daysBack, 10, 30) },
    { id: `b_${road.id}_${i}_2`, type: 'snack', at: at(daysBack, 13) },
    { id: `b_${road.id}_${i}_3`, type: 'rest', at: at(daysBack, 15, 30) },
  ];
  const spill = road.id === 'r1' && i === 3;

  return {
    id: `s_${road.id}_${i}`,
    roadId: road.id,
    site: road.places[i % road.places.length],
    startedAt: at(daysBack, 8),
    endedAt: at(daysBack, 17),
    status: 'completed',
    startProgress,
    endProgress: Math.round((startProgress + gains[i]) * 100) / 100,
    attendance,
    materials,
    breaks,
    incidentTags: spill ? ['waste'] : [],
    incidents: spill ? 'Minor bitumen spill near Gazipura Bus Stand. Area cleaned, no injuries.' : '',
    payroll: calculatePayroll(SEED_WORKERS, attendance),
    payrollStatus: i < gains.length - 1 ? 'approved' : 'pending',
  };
}

const PLANS: RoadPlan[] = [
  { road: ROADS[0], start: 36, gains: [1.4, 1.8, 1.1, 2.0, 1.6, 1.7], lastDaysBack: 1 },
  { road: ROADS[1], start: 12, gains: [2.5, 3.1, 2.2], lastDaysBack: 2 },
  { road: ROADS[2], start: 71, gains: [1.0, 0.8, 1.2, 0.9], lastDaysBack: 3 },
];

export const SEED_SHIFTS: Shift[] = PLANS.flatMap((plan) =>
  plan.gains.reduce<Shift[]>((list, _gain, i) => {
    const prev = list[list.length - 1];
    return [...list, seedShift(plan, i, prev?.endProgress ?? plan.start)];
  }, []),
);

const machine = (m: Omit<Machine, 'updatedAt' | 'hoursToday'> & { hoursToday?: number }): Machine => ({ hoursToday: 0, updatedAt: at(0, 7, 30), ...m });

export const SEED_MACHINES: Machine[] = [
  machine({ id: 'm1', roadId: 'r1', kind: 'roller', code: 'RL-01', status: 'working', fuelPct: 70, hoursSinceService: 120, operatorId: 'w5' }),
  machine({ id: 'm2', roadId: 'r1', kind: 'excavator', code: 'EX-02', status: 'working', fuelPct: 55, hoursSinceService: 236, operatorId: 'w3' }),
  machine({ id: 'm3', roadId: 'r1', kind: 'paver', code: 'PV-01', status: 'idle', fuelPct: 80, hoursSinceService: 60 }),
  machine({ id: 'm4', roadId: 'r1', kind: 'mixer', code: 'MX-03', status: 'repair', fuelPct: 40, hoursSinceService: 262 }),
  machine({ id: 'm5', roadId: 'r1', kind: 'truck', code: 'TR-07', status: 'working', fuelPct: 18, hoursSinceService: 90, operatorId: 'w1' }),
  machine({ id: 'm6', roadId: 'r1', kind: 'generator', code: 'GN-01', status: 'idle', fuelPct: 65, hoursSinceService: 30 }),
  machine({ id: 'm7', roadId: 'r2', kind: 'roller', code: 'RL-04', status: 'working', fuelPct: 62, hoursSinceService: 150, operatorId: 'w5' }),
  machine({ id: 'm8', roadId: 'r2', kind: 'truck', code: 'TR-02', status: 'idle', fuelPct: 85, hoursSinceService: 40 }),
  machine({ id: 'm9', roadId: 'r2', kind: 'mixer', code: 'MX-01', status: 'working', fuelPct: 22, hoursSinceService: 180 }),
  machine({ id: 'm10', roadId: 'r3', kind: 'paver', code: 'PV-02', status: 'working', fuelPct: 58, hoursSinceService: 255, operatorId: 'w3' }),
  machine({ id: 'm11', roadId: 'r3', kind: 'roller', code: 'RL-02', status: 'idle', fuelPct: 90, hoursSinceService: 75 }),
  machine({ id: 'm12', roadId: 'r3', kind: 'excavator', code: 'EX-05', status: 'repair', fuelPct: 35, hoursSinceService: 140 }),
  machine({ id: 'm13', roadId: 'r4', kind: 'excavator', code: 'EX-09', status: 'idle', fuelPct: 95, hoursSinceService: 10 }),
  machine({ id: 'm14', roadId: 'r4', kind: 'truck', code: 'TR-11', status: 'idle', fuelPct: 75, hoursSinceService: 20 }),
];

export const SEED_HEALTH: HealthReport[] = [
  { id: 'h0', workerId: 'w4', status: 'sick', note: 'Cough and fever.', at: at(12, 7, 5) },
  { id: 'h0b', workerId: 'w4', status: 'fit', note: '', at: at(10, 7, 0) },
  { id: 'h0c', workerId: 'w4', status: 'sick', note: 'Fever.', at: at(2, 7, 20) },
  { id: 'h0d', workerId: 'w4', status: 'sick', note: 'Still have fever.', at: at(1, 7, 5) },
  { id: 'h1', workerId: 'w4', status: 'sick', note: 'Fever since last night.', at: at(0, 7, 10) },
  { id: 'h2', workerId: 'w2', status: 'fit', note: '', at: at(0, 7, 25) },
  { id: 'h3', workerId: 'w1', status: 'fit', note: '', at: at(1, 7, 15) },
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    fromWorkerId: 'w5',
    anonymous: false,
    againstId: SUPERVISOR.id,
    category: 'conditions',
    message: 'Snacks were not given on Tuesday even though we worked past 6 PM.',
    createdAt: at(2, 18),
    status: 'reviewing',
  },
  {
    id: 'c2',
    fromWorkerId: 'w7',
    anonymous: true,
    againstId: 'w5',
    category: 'safety',
    message: 'Drives the roller without a helmet, very close to other workers.',
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
    reason: 'responsibility',
    details: 'Training two new masons on curb work for the past month.',
    createdAt: at(3, 19),
    status: 'pending',
  },
];
