import type { PostKey, Worker } from './types';

/** No one under 18 may be signed up for road work. */
export const MIN_WORK_AGE = 18;
export const MAX_WORK_AGE = 70;

/** Daily pay a new worker starts on, by the work they do. Head office can raise it later. */
export const STARTING_RATE: Record<PostKey, number> = {
  foreman: 1200,
  operator: 1100,
  roller: 1000,
  mason: 950,
  laborer: 700,
  helper: 600,
};

/** Avatar colours handed out in turn, so new faces are easy to tell apart. */
const COLORS = ['#2f6fb2', '#b83a3a', '#c95f12', '#3f7d31', '#8f6c00', '#7b3f98', '#137a79', '#7a5230'];

export interface WorkerDraft {
  name: string;
  age: number;
  post: PostKey | null;
}

export type WorkerProblem = 'name' | 'age' | 'post';

export function workerProblems(d: WorkerDraft): WorkerProblem[] {
  const out: WorkerProblem[] = [];
  if (d.name.trim().length < 2) out.push('name');
  if (!Number.isInteger(d.age) || d.age < MIN_WORK_AGE || d.age > MAX_WORK_AGE) out.push('age');
  if (!d.post) out.push('post');
  return out;
}

/** Builds the new worker. The name is used as typed, in Bangla or English. Call only when there are no problems. */
export function toWorker(d: WorkerDraft, id: string, count: number): Worker {
  const post = d.post ?? 'laborer';
  const name = d.name.trim().replace(/\s+/g, ' ');
  return { id, name, nameBn: name, post, age: d.age, dailyRate: STARTING_RATE[post], phone: '', color: COLORS[count % COLORS.length] };
}
