import type { Text } from '@/shared/i18n';
import type { ApaContext, QuestionKey } from './types';
import { FALLBACK } from './helpers';
import { answerPerson } from './answersPerson';
import { answerSite } from './answersSite';

export function answer(key: QuestionKey, ctx: ApaContext): Text {
  return answerPerson(key, ctx) ?? answerSite(key, ctx) ?? FALLBACK;
}
