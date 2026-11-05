import type { Attendance, BreakLog, Complaint, Health, MaterialLine, Person, Project, RaiseRequest, Shift, Worker } from './types';
import { MATERIALS, SITE_SEGMENTS } from './catalog';
import { calculatePayroll } from './payroll';

export const PROJECT: Project = {
  name: { en: 'Tongi–Gazipur Link Road', bn: 'টঙ্গী–গাজীপুর সংযোগ সড়ক' },
  section: { en: 'Section 3, chainage 0+000 to 4+200', bn: 'সেকশন ৩, চেইনেজ ০+০০০ থেকে ৪+২০০' },
  lengthKm: 4.2,
};

export const SUPERVISOR: Person = {
  id: 'supervisor',
  name: 'Engr. Tanvir Rahman',
  nameBn: 'প্রকৌ. তানভীর রহমান',
  look: { skin: '#b98153', hair: 'helmet', hairColor: '#ffffff', beard: 'moustache', beardColor: '#1f1a17', glasses: true, shirt: '#e2661e', bg: '#d6e6dc' },
};

export const SEED_WORKERS: Worker[] = [
  {
    id: 'w1', name: 'Abdul Karim', nameBn: 'আব্দুল করিম', post: 'foreman', age: 52, dailyRate: 1200, phone: '01711-000001',
    look: { skin: '#a8703f', hair: 'cap', hairColor: '#f4f1ea', beard: 'full', beardColor: '#cfc9bf', shirt: '#2f6fb2', bg: '#d9e5f4' },
  },
  {
    id: 'w2', name: 'Rahim Uddin', nameBn: 'রহিম উদ্দিন', post: 'mason', age: 34, dailyRate: 950, phone: '01711-000002',
    look: { skin: '#8d5a32', hair: 'short', hairColor: '#1f1a17', beard: 'moustache', shirt: '#b83a3a', bg: '#f5dfda' },
  },
  {
    id: 'w3', name: 'Jamal Hossain', nameBn: 'জামাল হোসেন', post: 'operator', age: 41, dailyRate: 1100, phone: '01711-000003',
    look: { skin: '#b07a4a', hair: 'side', hairColor: '#221c18', shirt: '#e07a1f', bg: '#fbe5cd' },
  },
  {
    id: 'w4', name: 'Shafiq Mia', nameBn: 'শফিক মিয়া', post: 'laborer', age: 58, dailyRate: 700, phone: '01711-000004',
    look: { skin: '#7a4a28', hair: 'bald', hairColor: '#d9d5cc', beard: 'full', beardColor: '#ebe8e1', shirt: '#4e8a3e', bg: '#dbebd4' },
  },
  {
    id: 'w5', name: 'Rubel Ahmed', nameBn: 'রুবেল আহমেদ', post: 'roller', age: 29, dailyRate: 1000, phone: '01711-000005',
    look: { skin: '#9a6234', hair: 'short', hairColor: '#191512', shirt: '#e8b923', bg: '#fff0c0' },
  },
  {
    id: 'w6', name: 'Halima Begum', nameBn: 'হালিমা বেগম', post: 'laborer', age: 45, dailyRate: 700, phone: '01711-000006',
    look: { skin: '#a56a3f', hair: 'scarf', hairColor: '#7b3f98', shirt: '#7b3f98', bg: '#e9dbf1' },
  },
  {
    id: 'w7', name: 'Sumon Das', nameBn: 'সুমন দাস', post: 'helper', age: 22, dailyRate: 600, phone: '01711-000007',
    look: { skin: '#8a5a33', hair: 'side', hairColor: '#15120f', shirt: '#1f8a8a', bg: '#d4eeec' },
  },
  {
    id: 'w8', name: 'Nurul Islam', nameBn: 'নুরুল ইসলাম', post: 'mason', age: 55, dailyRate: 950, phone: '01711-000008',
    look: { skin: '#94603a', hair: 'cap', hairColor: '#f4f1ea', beard: 'full', beardColor: '#6b5b50', glasses: true, shirt: '#7a5230', bg: '#eee1d2' },
  },
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

  const attendance: Attendance[] = SEED_WORKERS.map((w, idx) => {
    const absent = (idx + i) % 7 === 3;
    const health: Health = (idx * 3 + i) % 11 === 0 ? 'sick' : 'fit';
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
    wasted: Math.round(m.defaultQty * (0.01 + ((i * 2 + idx) % 3) * 0.015)),
  }));

  const breaks: BreakLog[] = [
    { id: `b_${i}_1`, type: 'rest', at: at(daysBack, 10, 30) },
    { id: `b_${i}_2`, type: 'snack', at: at(daysBack, 13) },
    { id: `b_${i}_3`, type: 'rest', at: at(daysBack, 15, 30) },
  ];

  return {
    id: `s_seed_${i}`,
    site: SITE_SEGMENTS[0],
    startedAt: at(daysBack, 8),
    endedAt: at(daysBack, 17),
    status: 'completed',
    startProgress,
    endProgress: Math.round((startProgress + GAINS[i]) * 10) / 10,
    attendance,
    materials,
    breaks,
    incidentTags: i === 3 ? ['waste'] : [],
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