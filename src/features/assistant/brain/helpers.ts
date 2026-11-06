import type { HealthReport, Machine, Shift } from '@/core/types';
import { makeI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import type { ApaContext } from './types';

export const en = makeI18n('en');
export const bn = makeI18n('bn');
export const both = (f: (i: typeof en) => string): Text => ({ en: f(en), bn: f(bn) });
export const list_ = (names: string[], lang: 'en' | 'bn') =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} ${lang === 'bn' ? 'ও' : 'and'} ${names[names.length - 1]}`;

export const byStart = (a: Shift, b: Shift) => a.startedAt.localeCompare(b.startedAt);
export const completed = (ctx: ApaContext) => ctx.shifts.filter((s) => s.status === 'completed' && s.roadId === ctx.road.id).sort(byStart);
export const activeShift = (ctx: ApaContext) => ctx.shifts.find((s) => s.status === 'active' && s.roadId === ctx.road.id);
export const sameDay = (iso: string, now: number) => new Date(iso).toDateString() === new Date(now).toDateString();
export const healthToday = (ctx: ApaContext, now: number) => {
  const latest = new Map<string, HealthReport>();
  ctx.health
    .filter((r) => sameDay(r.at, now))
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach((r) => latest.set(r.workerId, r));
  return Array.from(latest.values());
};
export const roadMachines = (ctx: ApaContext) => ctx.machines.filter((m) => m.roadId === ctx.road.id);
export const MACHINE_NAME = {
  roller: { en: 'Road roller', bn: 'রোড রোলার' },
  excavator: { en: 'Excavator', bn: 'এক্সকাভেটর' },
  paver: { en: 'Paver', bn: 'পেভার' },
  mixer: { en: 'Concrete mixer', bn: 'মিক্সার মেশিন' },
  truck: { en: 'Dump truck', bn: 'ডাম্প ট্রাক' },
  generator: { en: 'Generator', bn: 'জেনারেটর' },
} as const;
export const machineLabel = (m: Machine): Text => ({ en: `${MACHINE_NAME[m.kind].en} ${m.code}`, bn: `${MACHINE_NAME[m.kind].bn} ${m.code}` });
export const roadDone = (ctx: ApaContext) => {
  const done = completed(ctx);
  return done.length ? (done[done.length - 1].endProgress ?? 0) : 0;
};

export const FALLBACK: Text = {
  en: 'Sorry, I did not understand. Tap one of the questions below, or ask again in a few words.',
  bn: 'দুঃখিত, বুঝতে পারিনি। নিচের একটি প্রশ্নে চাপ দিন, অথবা অল্প কথায় আবার বলুন।',
};

export function greeting(ctx: ApaContext): Text {
  const name = ctx.worker ? { en: ` ${ctx.worker.name.split(' ')[0]}`, bn: ` ${ctx.worker.nameBn.split(' ')[0]}` } : { en: '', bn: '' };
  return {
    en: `Hello${name.en}! I am Apa. Tap a question below, or tap the microphone and ask me.`,
    bn: `হ্যালো${name.bn}! আমি আপা। নিচের একটি প্রশ্নে চাপ দিন, অথবা মাইকে চাপ দিয়ে আমাকে জিজ্ঞেস করুন।`,
  };
}
