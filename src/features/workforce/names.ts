import type { Person, Worker } from '@/core/types';
import { POSTS } from '@/core/catalog';
import type { Lang, Text } from '@/shared/i18n';

export const personName = (p: Person, lang: Lang) => (lang === 'bn' ? p.nameBn : p.name);

export const shortName = (p: Person, lang: Lang) =>
  personName(p, lang)
    .replace(/^(Engr\.|প্রকৌ\.)\s*/, '')
    .split(' ')[0];

export const isWorker = (p: Person): p is Worker => 'post' in p;

export const roleOf = (p: Person): Text => (isWorker(p) ? POSTS[p.post] : { en: 'Supervisor', bn: 'সুপারভাইজার' });

/** "Rahim Uddin, Mason" in either language, for reading aloud. */
export const spokenName = (p: Person): Text => ({
  en: `${p.name}, ${roleOf(p).en}`,
  bn: `${p.nameBn}, ${roleOf(p).bn}`,
});