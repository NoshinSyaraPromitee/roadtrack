import type { Role } from '@/core/types';
import type { Text } from '@/shared/i18n';
import type { ApaContext, QuestionKey } from './types';
import { QUESTIONS } from './questions';

export const questionLabel = (key: QuestionKey, role: Role): Text => QUESTIONS[key].labelBy?.[role] ?? QUESTIONS[key].label;

export function questionsFor(ctx: Pick<ApaContext, 'role' | 'shifts'>): QuestionKey[] {
  const active = ctx.shifts.some((s) => s.status === 'active');
  if (ctx.role === 'worker') return ['my_pay', 'health', 'next_break', 'raise', 'complaints', 'daily_rate', 'extra_pay', 'how_complain'];
  if (ctx.role === 'supervisor') return ['shift_now', 'next_break', active ? 'how_finish' : 'how_start', 'health', 'machines', 'crew_care', 'progress', 'help'];
  return ['progress', 'pay_pending', 'machines', 'complaints', 'raise', 'waste', 'health', 'help'];
}

const askable = (role: Role): QuestionKey[] => {
  if (role === 'worker') return ['my_pay', 'health', 'next_break', 'raise', 'complaints', 'daily_rate', 'extra_pay', 'how_complain', 'progress', 'help', 'intro'];
  if (role === 'supervisor') return ['shift_now', 'next_break', 'how_start', 'how_finish', 'health', 'machines', 'crew_care', 'progress', 'extra_pay', 'waste', 'pay_pending', 'help', 'intro'];
  return ['progress', 'pay_pending', 'machines', 'complaints', 'raise', 'waste', 'health', 'extra_pay', 'help', 'intro'];
};

export function matchQuestion(said: string, role: Role): QuestionKey | null {
  const text = ` ${said.toLowerCase().replace(/[?!.,।]/g, ' ')} `;
  let best: QuestionKey | null = null;
  let bestScore = 0;
  for (const key of askable(role)) {
    const score = QUESTIONS[key].words.reduce((s, w) => (text.includes(w.toLowerCase()) ? s + w.length : s), 0);
    if (score > bestScore) {
      best = key;
      bestScore = score;
    }
  }
  return best;
}
