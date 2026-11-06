import type { Attendance, BreakLog, Health, MaterialLine, Road, Shift } from '@/core/types';
import { MATERIALS } from '@/core/catalog';
import { calculatePayroll } from '@/core/payroll';
import { ROADS } from '@/core/roads';
import { SEED_WORKERS } from './seedPeople';

export const at = (daysBack: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

interface RoadPlan {
  road: Road;
  start: number;
  gains: number[];
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
    incidents: spill ? 'গাজীপুরা বাসস্ট্যান্ডের কাছে অল্প বিটুমিন পড়ে গিয়েছিল। জায়গা পরিষ্কার করা হয়েছে, কেউ আহত হয়নি।' : '',
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
