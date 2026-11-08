import { describe, expect, it } from 'vitest';
import { MIN_WORK_AGE, STARTING_RATE, toWorker, workerProblems } from '../newWorker';

const draft = { name: 'Shafiq Mia', age: 30, post: 'mason' as const };

describe('workerProblems', () => {
  it('accepts name, age and work', () => {
    expect(workerProblems(draft)).toEqual([]);
  });

  it('needs a name, a working age and a job', () => {
    expect(workerProblems({ name: ' ', age: 30, post: null })).toEqual(['name', 'post']);
  });

  it('refuses anyone under 18 or over 70', () => {
    expect(workerProblems({ ...draft, age: MIN_WORK_AGE - 1 })).toEqual(['age']);
    expect(workerProblems({ ...draft, age: 71 })).toEqual(['age']);
  });
});

describe('toWorker', () => {
  it('starts on the pay for that work and keeps the name as typed', () => {
    const w = toWorker({ ...draft, name: '  শফিক   মিয়া ' }, 'w9', 0);
    expect(w).toMatchObject({ id: 'w9', name: 'শফিক মিয়া', nameBn: 'শফিক মিয়া', post: 'mason', age: 30, dailyRate: STARTING_RATE.mason });
  });

  it('gives different colours to new workers in turn', () => {
    expect(toWorker(draft, 'a', 0).color).not.toBe(toWorker(draft, 'b', 1).color);
  });
});
