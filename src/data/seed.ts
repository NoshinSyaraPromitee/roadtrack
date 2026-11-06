import type { Complaint, HealthReport, Machine, RaiseRequest } from '@/core/types';
import { at } from './seedShifts';
import { SUPERVISOR } from './seedPeople';

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
  { id: 'h0', workerId: 'w4', status: 'sick', note: 'কাশি আর জ্বর।', at: at(12, 7, 5) },
  { id: 'h0b', workerId: 'w4', status: 'fit', note: '', at: at(10, 7, 0) },
  { id: 'h0c', workerId: 'w4', status: 'sick', note: 'জ্বর।', at: at(2, 7, 20) },
  { id: 'h0d', workerId: 'w4', status: 'sick', note: 'এখনো জ্বর আছে।', at: at(1, 7, 5) },
  { id: 'h1', workerId: 'w4', status: 'sick', note: 'গত রাত থেকে জ্বর।', at: at(0, 7, 10) },
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
    message: 'মঙ্গলবার সন্ধ্যা ৬টার পরেও কাজ করেছি, কিন্তু নাস্তা দেওয়া হয়নি।',
    createdAt: at(2, 18),
    status: 'reviewing',
  },
  {
    id: 'c2',
    anonymous: true,
    againstId: 'w5',
    category: 'safety',
    message: 'হেলমেট ছাড়া রোলার চালায়, অন্য শ্রমিকদের খুব কাছ দিয়ে।',
    createdAt: at(1, 17),
    status: 'open',
  },
];

export const SEED_RECEIPTS: Record<string, string[]> = { w7: ['c2'] };

export const SEED_RAISES: RaiseRequest[] = [
  {
    id: 'r1',
    workerId: 'w2',
    currentRate: 950,
    requestedRate: 1050,
    reason: 'responsibility',
    details: 'গত এক মাস ধরে দুজন নতুন রাজমিস্ত্রিকে কার্ব বসানোর কাজ শেখাচ্ছি।',
    createdAt: at(3, 19),
    status: 'pending',
  },
];

export { SEED_WORKERS, SUPERVISOR } from './seedPeople';
export { SEED_SHIFTS } from './seedShifts';
