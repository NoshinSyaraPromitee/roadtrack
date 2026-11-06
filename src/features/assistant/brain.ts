import { Coffee, Construction, Flag, HandCoins, HeartHandshake, HeartPulse, Info, Megaphone, MessageCircleQuestion, Play, Stethoscope, Trash2, Tractor, TrendingUp, Wallet, CircleHelp, BadgeCheck } from 'lucide-react';
import type { Complaint, HealthReport, Machine, RaiseRequest, Road, Role, Shift, Worker } from '@/core/types';
import { COMPLAINT_CATEGORIES, MATERIAL_BY_KEY, MATERIALS } from '@/core/catalog';
import { PAYROLL_RULES } from '@/core/payroll';
import { getBreakStatus } from '@/core/reminderPolicy';
import { sickDays } from '@/core/health';
import { pctToKm } from '@/core/roads';
import { makeI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import type { IconType } from '@/shared/ui';

/**
 * Apa's built-in brain. No internet and no AI service: every answer is read from the app's own data,
 * so it always works offline. Swap `answer` for an AI call later without touching the UI.
 */

export type QuestionKey =
  | 'my_pay'
  | 'daily_rate'
  | 'raise'
  | 'complaints'
  | 'next_break'
  | 'extra_pay'
  | 'how_complain'
  | 'shift_now'
  | 'how_start'
  | 'how_finish'
  | 'crew_care'
  | 'progress'
  | 'pay_pending'
  | 'waste'
  | 'help'
  | 'machines'
  | 'health'
  | 'intro';

export interface ApaContext {
  role: Role;
  road: Road;
  worker?: Worker;
  workers: Worker[];
  /** Shifts on every road. Answers about the road filter them; a worker's pay uses all of them. */
  shifts: Shift[];
  machines: Machine[];
  health: HealthReport[];
  raises: RaiseRequest[];
  complaints: Complaint[];
  /** Defaults to the current time. */
  now?: number;
}

interface QuestionDef {
  icon: IconType;
  label: Text;
  labelBy?: Partial<Record<Role, Text>>;
  /** Words a person might say. Longer matches count for more. */
  words: string[];
}

export const QUESTIONS: Record<QuestionKey, QuestionDef> = {
  my_pay: {
    icon: Wallet,
    label: { en: 'How much did I earn?', bn: 'আমি কত টাকা পেয়েছি?' },
    words: ['earn', 'money', 'paid', 'income', 'how much', 'salary', 'টাকা', 'আয়', 'পেয়েছি', 'পেলাম', 'কত টাকা', 'মজুরি কত', 'টাকা পাব'],
  },
  daily_rate: {
    icon: HandCoins,
    label: { en: 'What is my daily pay?', bn: 'আমার দৈনিক মজুরি কত?' },
    words: ['daily', 'daily pay', 'per day', 'rate', 'a day', 'দৈনিক', 'দৈনিক মজুরি', 'রোজ', 'প্রতিদিন', 'হাজিরা'],
  },
  raise: {
    icon: TrendingUp,
    label: { en: 'Is my raise approved?', bn: 'আমার বেতন বাড়ল কি?' },
    labelBy: { admin: { en: 'Any raise requests?', bn: 'বেতন বৃদ্ধির আবেদন আছে?' } },
    words: ['raise', 'increase', 'more pay', 'hike', 'বাড়', 'বৃদ্ধি', 'বাড়ানো', 'বাড়াতে'],
  },
  complaints: {
    icon: Megaphone,
    label: { en: 'What happened to my complaint?', bn: 'আমার অভিযোগের কী হলো?' },
    labelBy: { admin: { en: 'How many complaints are open?', bn: 'কতগুলো অভিযোগ বাকি?' } },
    words: ['complaint', 'complain', 'problem', 'অভিযোগ', 'নালিশ', 'সমস্যা'],
  },
  next_break: {
    icon: Coffee,
    label: { en: 'When is the next break?', bn: 'পরের বিরতি কখন?' },
    words: ['break', 'rest', 'snack', 'tea', 'lunch', 'tired', 'বিরতি', 'বিশ্রাম', 'নাস্তা', 'চা', 'খাবার', 'ক্লান্ত'],
  },
  extra_pay: {
    icon: HeartHandshake,
    label: { en: 'Who gets extra pay?', bn: 'কারা বাড়তি টাকা পান?' },
    words: ['extra', 'bonus', 'old', 'sick', 'hurt', 'cut', 'বাড়তি', 'বোনাস', 'বয়স্ক', 'অসুস্থ', 'আহত', 'কাটা'],
  },
  how_complain: {
    icon: MessageCircleQuestion,
    label: { en: 'How do I complain?', bn: 'কীভাবে অভিযোগ করব?' },
    words: ['how to complain', 'how do i complain', 'make a complaint', 'কীভাবে অভিযোগ', 'কিভাবে অভিযোগ', 'অভিযোগ করব', 'অভিযোগ করতে'],
  },
  shift_now: {
    icon: Construction,
    label: { en: "How is today's work going?", bn: 'আজকের কাজ কেমন চলছে?' },
    words: ['today', 'shift', 'working', 'site', 'on site', 'আজ', 'শিফট', 'কাজ চলছে', 'সাইট', 'কতজন'],
  },
  how_start: {
    icon: Play,
    label: { en: 'How do I start work?', bn: 'কাজ কীভাবে শুরু করব?' },
    words: ['start', 'begin', 'শুরু'],
  },
  how_finish: {
    icon: Flag,
    label: { en: 'How do I finish the shift?', bn: 'শিফট কীভাবে শেষ করব?' },
    words: ['finish', 'end', 'close', 'done for', 'শেষ'],
  },
  crew_care: {
    icon: HeartPulse,
    label: { en: 'Who needs extra care?', bn: 'কার বেশি খেয়াল রাখতে হবে?' },
    words: ['care', 'elder', 'older', 'who needs', 'safety', 'খেয়াল', 'যত্ন', 'বয়স্ক', 'নিরাপত্তা'],
  },
  progress: {
    icon: Construction,
    label: { en: 'How much road is done?', bn: 'রাস্তার কতটা হয়েছে?' },
    words: ['progress', 'road', 'percent', 'km', 'kilometre', 'how far', 'অগ্রগতি', 'রাস্তা', 'কতটা', 'কিলোমিটার'],
  },
  pay_pending: {
    icon: BadgeCheck,
    label: { en: 'Any pay to approve?', bn: 'অনুমোদনের মজুরি আছে?' },
    words: ['approve', 'approval', 'pay list', 'payroll', 'wage', 'অনুমোদন', 'মজুরির তালিকা', 'মজুরি'],
  },
  waste: {
    icon: Trash2,
    label: { en: 'How much was wasted?', bn: 'কতটা মাল নষ্ট হয়েছে?' },
    words: ['waste', 'wasted', 'loss', 'material', 'নষ্ট', 'অপচয়', 'মাল', 'মালামাল'],
  },
  help: {
    icon: CircleHelp,
    label: { en: 'What can I do here?', bn: 'এখানে কী কী করা যায়?' },
    words: ['help', 'how to use', 'what can', 'tab', 'সাহায্য', 'কী করা যায়', 'কীভাবে', 'কিভাবে', 'ব্যবহার'],
  },
  machines: {
    icon: Tractor,
    label: { en: 'Are the machines working?', bn: 'মেশিনগুলো চলছে তো?' },
    words: ['machine', 'machines', 'roller', 'truck', 'fuel', 'diesel', 'broken', 'excavator', 'মেশিন', 'রোলার', 'ট্রাক', 'জ্বালানি', 'তেল', 'নষ্ট মেশিন'],
  },
  health: {
    icon: Stethoscope,
    label: { en: 'How do I tell I am sick?', bn: 'অসুস্থ হলে কীভাবে জানাব?' },
    labelBy: {
      supervisor: { en: 'Is anyone sick today?', bn: 'আজ কেউ অসুস্থ?' },
      admin: { en: 'Is anyone sick today?', bn: 'আজ কেউ অসুস্থ?' },
    },
    words: ['sick', 'ill', 'fever', 'health', 'hurt', 'unwell', 'অসুস্থ', 'জ্বর', 'শরীর', 'স্বাস্থ্য', 'আহত', 'অসুখ', 'ব্যথা'],
  },
  intro: {
    icon: Info,
    label: { en: 'Who are you?', bn: 'আপনি কে?' },
    words: ['who are you', 'your name', 'hello', 'apa', 'আপনি কে', 'তুমি কে', 'আপনার নাম', 'হ্যালো', 'আপা', 'সালাম'],
  },
};

export const questionLabel = (key: QuestionKey, role: Role): Text => QUESTIONS[key].labelBy?.[role] ?? QUESTIONS[key].label;

/** The questions shown as tiles, most useful first. */
export function questionsFor(ctx: Pick<ApaContext, 'role' | 'shifts'>): QuestionKey[] {
  const active = ctx.shifts.some((s) => s.status === 'active');
  if (ctx.role === 'worker') return ['my_pay', 'health', 'next_break', 'raise', 'complaints', 'daily_rate', 'extra_pay', 'how_complain'];
  if (ctx.role === 'supervisor') return ['shift_now', 'next_break', active ? 'how_finish' : 'how_start', 'health', 'machines', 'crew_care', 'progress', 'help'];
  return ['progress', 'pay_pending', 'machines', 'complaints', 'raise', 'waste', 'health', 'help'];
}

/** Every question this role may ask by voice, including ones not shown as tiles. */
const askable = (role: Role): QuestionKey[] => {
  if (role === 'worker') return ['my_pay', 'health', 'next_break', 'raise', 'complaints', 'daily_rate', 'extra_pay', 'how_complain', 'progress', 'help', 'intro'];
  if (role === 'supervisor') return ['shift_now', 'next_break', 'how_start', 'how_finish', 'health', 'machines', 'crew_care', 'progress', 'extra_pay', 'waste', 'pay_pending', 'help', 'intro'];
  return ['progress', 'pay_pending', 'machines', 'complaints', 'raise', 'waste', 'health', 'extra_pay', 'help', 'intro'];
};

/** Finds the question a spoken or typed sentence is closest to. */
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

const en = makeI18n('en');
const bn = makeI18n('bn');
const both = (f: (i: typeof en) => string): Text => ({ en: f(en), bn: f(bn) });
const list_ = (names: string[], lang: 'en' | 'bn') =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} ${lang === 'bn' ? 'ও' : 'and'} ${names[names.length - 1]}`;

const byStart = (a: Shift, b: Shift) => a.startedAt.localeCompare(b.startedAt);
/** Finished shifts on the chosen road. */
const completed = (ctx: ApaContext) => ctx.shifts.filter((s) => s.status === 'completed' && s.roadId === ctx.road.id).sort(byStart);
const activeShift = (ctx: ApaContext) => ctx.shifts.find((s) => s.status === 'active' && s.roadId === ctx.road.id);
const sameDay = (iso: string, now: number) => new Date(iso).toDateString() === new Date(now).toDateString();
/** Each worker's newest health report from today. */
const healthToday = (ctx: ApaContext, now: number) => {
  const latest = new Map<string, HealthReport>();
  ctx.health
    .filter((r) => sameDay(r.at, now))
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach((r) => latest.set(r.workerId, r));
  return Array.from(latest.values());
};
const roadMachines = (ctx: ApaContext) => ctx.machines.filter((m) => m.roadId === ctx.road.id);
const MACHINE_NAME = {
  roller: { en: 'Road roller', bn: 'রোড রোলার' },
  excavator: { en: 'Excavator', bn: 'এক্সকাভেটর' },
  paver: { en: 'Paver', bn: 'পেভার' },
  mixer: { en: 'Concrete mixer', bn: 'মিক্সার মেশিন' },
  truck: { en: 'Dump truck', bn: 'ডাম্প ট্রাক' },
  generator: { en: 'Generator', bn: 'জেনারেটর' },
} as const;
const machineLabel = (m: Machine): Text => ({ en: `${MACHINE_NAME[m.kind].en} ${m.code}`, bn: `${MACHINE_NAME[m.kind].bn} ${m.code}` });
const roadDone = (ctx: ApaContext) => {
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

export function answer(key: QuestionKey, ctx: ApaContext): Text {
  const w = ctx.worker;
  const now = ctx.now ?? Date.now();
  switch (key) {
    case 'intro':
      return {
        en: 'I am Apa, your helper on the road site. I read pay, breaks, requests and road progress from this app and tell you. I work without internet.',
        bn: 'আমি আপা, রাস্তার সাইটে আপনার সহকারী। এই অ্যাপ থেকে মজুরি, বিরতি, আবেদন আর রাস্তার অগ্রগতির খবর বলে দিই। আমি ইন্টারনেট ছাড়াই কাজ করি।',
      };

    case 'my_pay': {
      if (!w) return answer('pay_pending', ctx);
      const entries = ctx.shifts.filter((s) => s.status === 'completed').sort(byStart).flatMap((s) => {
        const line = s.payroll.find((l) => l.workerId === w.id);
        return line ? [{ s, line }] : [];
      });
      if (!entries.length) {
        return { en: 'You have no pay yet. Your pay shows after the supervisor ends a shift.', bn: 'এখনো কোনো মজুরি নেই। সুপারভাইজার শিফট শেষ করলে মজুরি দেখাবে।' };
      }
      const last = entries[entries.length - 1];
      const paid = entries.filter((e) => e.s.payrollStatus === 'approved').reduce((t, e) => t + e.line.total, 0);
      const waiting = entries.filter((e) => e.s.payrollStatus === 'pending').reduce((t, e) => t + e.line.total, 0);
      const lastPaid = last.s.payrollStatus === 'approved';
      if (last.line.flags.includes('absent')) {
        return {
          en: `You were not at work on ${en.date(last.s.startedAt)}, so there is no pay for that day. In total you have been paid ${en.num(paid)} taka, and you will get ${en.num(waiting)} taka after work.`,
          bn: `${bn.date(last.s.startedAt)} তারিখে আপনি কাজে ছিলেন না, তাই সেদিনের মজুরি নেই। মোট ${bn.num(paid)} টাকা পেয়েছেন, আর ${bn.num(waiting)} টাকা কাজের পরে পাবেন।`,
        };
      }
      const extra = last.line.welfareBonus > 0 ? both((i) => (i.lang === 'bn' ? ` এর মধ্যে ${i.num(last.line.welfareBonus)} টাকা বাড়তি সহায়তা।` : ` That includes ${i.num(last.line.welfareBonus)} taka extra help.`)) : { en: '', bn: '' };
      const cut = last.line.deduction > 0 ? both((i) => (i.lang === 'bn' ? ` আগে চলে যাওয়ায় ${i.num(last.line.deduction)} টাকা কাটা হয়েছে।` : ` ${i.num(last.line.deduction)} taka was cut because you left early.`)) : { en: '', bn: '' };
      return {
        en: `On ${en.date(last.s.startedAt)} you earned ${en.num(last.line.total)} taka, ${lastPaid ? 'and it is paid' : 'and you will get it after work'}.${extra.en}${cut.en} In total you have been paid ${en.num(paid)} taka, and you will get ${en.num(waiting)} taka after work.`,
        bn: `${bn.date(last.s.startedAt)} তারিখে আপনি ${bn.num(last.line.total)} টাকা আয় করেছেন, ${lastPaid ? 'টাকা দেওয়া হয়েছে' : 'কাজের পরে পাবেন'}।${extra.bn}${cut.bn} মোট ${bn.num(paid)} টাকা পেয়েছেন, আর ${bn.num(waiting)} টাকা কাজের পরে পাবেন।`,
      };
    }

    case 'daily_rate':
      if (!w) return answer('extra_pay', ctx);
      return { en: `Your daily pay is ${en.num(w.dailyRate)} taka.`, bn: `আপনার দৈনিক মজুরি ${bn.num(w.dailyRate)} টাকা।` };

    case 'raise': {
      if (!w) {
        const pending = ctx.raises.filter((r) => r.status === 'pending');
        if (!pending.length) return { en: 'There are no raise requests waiting.', bn: 'কোনো বেতন বৃদ্ধির আবেদন অপেক্ষায় নেই।' };
        const names = pending.map((r) => ctx.workers.find((x) => x.id === r.workerId)).filter((x): x is Worker => !!x);
        return {
          en: `${en.num(pending.length)} raise requests are waiting, from ${list_(names.map((x) => x.name), 'en')}. Open the Raises tab to decide.`,
          bn: `${bn.num(pending.length)}টি বেতন বৃদ্ধির আবেদন অপেক্ষায়, ${list_(names.map((x) => x.nameBn), 'bn')}-এর কাছ থেকে। সিদ্ধান্ত দিতে "বেতন বৃদ্ধি" ট্যাব খুলুন।`,
        };
      }
      const mine = ctx.raises.filter((r) => r.workerId === w.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const last = mine[mine.length - 1];
      if (!last) return { en: 'You have not asked for a raise. Open More pay to ask.', bn: 'আপনি বেতন বাড়ানোর আবেদন করেননি। আবেদন করতে "বেতন বাড়ান" খুলুন।' };
      if (last.status === 'pending')
        return { en: `Your request for ${en.num(last.requestedRate)} taka a day is waiting for the office.`, bn: `দৈনিক ${bn.num(last.requestedRate)} টাকার আবেদনটি অফিসের অপেক্ষায় আছে।` };
      if (last.status === 'approved')
        return { en: `Good news! Your raise to ${en.num(last.requestedRate)} taka a day was approved.`, bn: `সুখবর! দৈনিক ${bn.num(last.requestedRate)} টাকায় বেতন বাড়ানো অনুমোদন হয়েছে।` };
      return { en: `The office said no to ${en.num(last.requestedRate)} taka a day. You can ask again.`, bn: `অফিস দৈনিক ${bn.num(last.requestedRate)} টাকার আবেদনে না করেছে। আপনি আবার আবেদন করতে পারেন।` };
    }

    case 'complaints': {
      if (!w) {
        const open = ctx.complaints.filter((c) => c.status === 'open').length;
        const checking = ctx.complaints.filter((c) => c.status === 'reviewing').length;
        if (!open && !checking) return { en: 'All complaints are solved.', bn: 'সব অভিযোগের সমাধান হয়েছে।' };
        return {
          en: `${en.num(open + checking)} complaints are not solved. ${en.num(open)} are not opened yet and ${en.num(checking)} are being checked.`,
          bn: `${bn.num(open + checking)}টি অভিযোগের সমাধান হয়নি। ${bn.num(open)}টি এখনো খোলা হয়নি, ${bn.num(checking)}টি দেখা হচ্ছে।`,
        };
      }
      const mine = ctx.complaints.filter((c) => c.fromWorkerId === w.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const last = mine[mine.length - 1];
      if (!last) return { en: 'You have not made any complaint.', bn: 'আপনি কোনো অভিযোগ করেননি।' };
      const cat = COMPLAINT_CATEGORIES[last.category];
      const state = {
        open: { en: 'was sent. The office has not opened it yet.', bn: 'পাঠানো হয়েছে। অফিস এখনো খোলেনি।' },
        reviewing: { en: 'is being checked by the office.', bn: 'অফিস দেখছে।' },
        resolved: { en: 'is solved.', bn: 'সমাধান হয়েছে।' },
      }[last.status];
      return { en: `Your complaint about ${cat.en.toLowerCase()} ${state.en}`, bn: `"${cat.bn}" বিষয়ে আপনার অভিযোগ ${state.bn}` };
    }

    case 'next_break': {
      const shift = activeShift(ctx);
      if (!shift) return { en: 'No shift is running now, so there is no break timer.', bn: 'এখন কোনো শিফট চলছে না, তাই বিরতির সময় নেই।' };
      const st = getBreakStatus(shift.startedAt, shift.breaks, now);
      const name = { rest: { en: 'rest', bn: 'বিশ্রাম', of: 'বিশ্রামের' }, snack: { en: 'snack', bn: 'নাস্তা', of: 'নাস্তার' } };
      if (st.due) {
        return ctx.role === 'worker'
          ? { en: `It is ${name[st.due].en} time now. Ask your supervisor and drink water.`, bn: `এখন ${name[st.due].of} সময়। সুপারভাইজারকে বলুন, আর পানি খান।` }
          : { en: `It is ${name[st.due].en} time now. Let the crew sit in the shade with water.`, bn: `এখন ${name[st.due].of} সময়। সবাইকে পানি নিয়ে ছায়ায় বসতে দিন।` };
      }
      const min = Math.max(1, Math.ceil(st.msUntilNext / 60_000));
      return { en: `The next ${name[st.nextType].en} is in ${en.num(min)} minutes.`, bn: `পরের ${name[st.nextType].bn} ${bn.num(min)} মিনিট পরে।` };
    }

    case 'extra_pay':
      return {
        en: `Workers aged ${PAYROLL_RULES.seniorAge} or more get ${PAYROLL_RULES.seniorBonusPct}% extra. Sick or hurt workers get ${PAYROLL_RULES.healthBonusPct}% extra. Leaving early cuts ${PAYROLL_RULES.earlyLeaveCutPct}% of the day's pay.`,
        bn: `${bn.num(PAYROLL_RULES.seniorAge)} বছর বা বেশি বয়সীরা ${bn.num(PAYROLL_RULES.seniorBonusPct)}% বাড়তি পান। অসুস্থ বা আহত হলে ${bn.num(PAYROLL_RULES.healthBonusPct)}% বাড়তি। আগে চলে গেলে দিনের মজুরির ${bn.num(PAYROLL_RULES.earlyLeaveCutPct)}% কাটা যায়।`,
      };

    case 'how_complain':
      return {
        en: 'Tap Complain. Tap the person, tap what happened, then tap the microphone and tell it in your voice. You can hide your name.',
        bn: '"অভিযোগ" চাপুন। মানুষটির উপর চাপ দিন, কী হয়েছে তা চাপুন, তারপর মাইকে চাপ দিয়ে নিজের কণ্ঠে বলুন। চাইলে নাম গোপন রাখতে পারেন।',
      };

    case 'shift_now': {
      const shift = activeShift(ctx);
      if (!shift) return { en: 'No shift is running. Choose who came, add materials and tap Start work.', bn: 'এখন কোনো শিফট চলছে না। কে এসেছে বাছাই করুন, মাল দিন, তারপর "কাজ শুরু করুন" চাপুন।' };
      const hours = Math.floor((now - new Date(shift.startedAt).getTime()) / 3_600_000);
      const mins = Math.floor(((now - new Date(shift.startedAt).getTime()) % 3_600_000) / 60_000);
      return {
        en: `Work started at ${en.time(shift.startedAt)} at ${shift.site.en}, ${en.num(hours)} hours ${en.num(mins)} minutes ago. ${en.num(shift.attendance.length)} workers are on site. ${en.fixed(pctToKm(shift.startProgress, ctx.road), 2)} km of the road was done this morning.`,
        bn: `${bn.time(shift.startedAt)}-এ ${shift.site.bn}-এ কাজ শুরু হয়েছে, ${bn.num(hours)} ঘণ্টা ${bn.num(mins)} মিনিট আগে। সাইটে ${bn.num(shift.attendance.length)} জন শ্রমিক। সকালে রাস্তার ${bn.fixed(pctToKm(shift.startProgress, ctx.road), 2)} কিমি কাজ হয়েছিল।`,
      };
    }

    case 'how_start':
      return {
        en: 'Four steps, in order. First, today\'s work: tap the workers who came, set the materials and choose the place. Second, check the machines. Third, check the crew\'s health. Last, tap Start work.',
        bn: 'চারটি ধাপ, পরপর। প্রথমে আজকের কাজ: যারা এসেছেন তাদের চাপুন, মাল ঠিক করুন, জায়গা বাছাই করুন। তারপর মেশিন দেখুন। তারপর শ্রমিকদের স্বাস্থ্য দেখুন। শেষে "কাজ শুরু করুন" চাপুন।',
      };

    case 'how_finish':
      return {
        en: 'Tap Finish work. Mark who left and who is sick or hurt. Enter materials used and wasted. Mark the road done and any problems. Then send the pay list to the office.',
        bn: '"কাজ শেষ করুন" চাপুন। কে চলে গেছে, কে অসুস্থ বা আহত চিহ্ন দিন। খরচ আর নষ্ট মাল দিন। রাস্তার অগ্রগতি আর সমস্যা দিন। তারপর মজুরির তালিকা অফিসে পাঠান।',
      };

    case 'crew_care': {
      const shift = activeShift(ctx);
      const pool = shift ? ctx.workers.filter((x) => shift.attendance.some((a) => a.workerId === x.id)) : ctx.workers;
      const elders = pool.filter((x) => x.age >= PAYROLL_RULES.seniorAge);
      if (!elders.length) return { en: 'No older workers today. Still give water and shade at every break.', bn: 'আজ কোনো বয়স্ক শ্রমিক নেই। তবুও প্রতি বিরতিতে পানি আর ছায়া দিন।' };
      return {
        en: `${list_(elders.map((x) => x.name), 'en')} ${elders.length > 1 ? 'are' : 'is'} ${PAYROLL_RULES.seniorAge} or older. Check on them first at every break, and mark anyone sick when you finish.`,
        bn: `${list_(elders.map((x) => x.nameBn), 'bn')}-এর বয়স ${bn.num(PAYROLL_RULES.seniorAge)} বা বেশি। প্রতি বিরতিতে আগে তাদের খোঁজ নিন, আর শেষে কেউ অসুস্থ হলে চিহ্ন দিন।`,
      };
    }

    case 'progress': {
      const p = roadDone(ctx);
      const done = completed(ctx);
      const last = done[done.length - 1];
      const gain = last ? (last.endProgress ?? last.startProgress) - last.startProgress : 0;
      const km = pctToKm(p, ctx.road);
      const gainKm = pctToKm(gain, ctx.road);
      return {
        en: `${ctx.road.name.en} is ${en.fixed(p)}% done. That is ${en.fixed(km, 2)} of ${en.fixed(ctx.road.lengthKm)} kilometres.${last ? ` The last shift added ${en.fixed(gainKm, 2)} km.` : ''}`,
        bn: `${ctx.road.name.bn}-এর ${bn.fixed(p)}% কাজ হয়েছে। মানে ${bn.fixed(ctx.road.lengthKm)} কিলোমিটারের মধ্যে ${bn.fixed(km, 2)} কিলোমিটার।${last ? ` শেষ শিফটে ${bn.fixed(gainKm, 2)} কিমি হয়েছে।` : ''}`,
      };
    }

    case 'pay_pending': {
      const pending = completed(ctx).filter((s) => s.payrollStatus === 'pending');
      if (!pending.length) return { en: 'All pay lists are approved. Nothing is waiting.', bn: 'সব মজুরির তালিকা অনুমোদন হয়েছে। কিছু অপেক্ষায় নেই।' };
      const total = pending.reduce((t, s) => t + s.payroll.reduce((x, l) => x + l.total, 0), 0);
      return ctx.role === 'admin'
        ? { en: `${en.num(pending.length)} pay lists are waiting for your approval, ${en.num(total)} taka in total. Open the Pay tab.`, bn: `${bn.num(pending.length)}টি মজুরির তালিকা আপনার অনুমোদনের অপেক্ষায়, মোট ${bn.num(total)} টাকা। "মজুরি" ট্যাব খুলুন।` }
        : { en: `${en.num(pending.length)} pay lists, ${en.num(total)} taka in total, are waiting for the head office.`, bn: `${bn.num(pending.length)}টি মজুরির তালিকা, মোট ${bn.num(total)} টাকা, প্রধান কার্যালয়ের অপেক্ষায়।` };
    }

    case 'waste': {
      const done = completed(ctx);
      if (!done.length) return { en: 'No finished shifts yet, so nothing is counted.', bn: 'এখনো কোনো শিফট শেষ হয়নি, তাই হিসাব নেই।' };
      const rows = MATERIALS.map((m) => {
        const lines = done.flatMap((s) => s.materials.filter((l) => l.key === m.key));
        const given = lines.reduce((t, l) => t + l.allocated, 0);
        const wasted = lines.reduce((t, l) => t + l.wasted, 0);
        return { key: m.key, pct: given ? (wasted / given) * 100 : 0 };
      });
      const allGiven = done.reduce((t, s) => t + s.materials.reduce((x, l) => x + l.allocated, 0), 0);
      const allWasted = done.reduce((t, s) => t + s.materials.reduce((x, l) => x + l.wasted, 0), 0);
      const worst = [...rows].sort((a, b) => b.pct - a.pct)[0];
      const name = MATERIAL_BY_KEY[worst.key].name;
      const all = allGiven ? (allWasted / allGiven) * 100 : 0;
      return {
        en: `About ${en.fixed(all)}% of all material was wasted. The most waste is ${name.en.toLowerCase()}, at ${en.fixed(worst.pct)}%.`,
        bn: `সব মালের প্রায় ${bn.fixed(all)}% নষ্ট হয়েছে। সবচেয়ে বেশি নষ্ট ${name.bn}, ${bn.fixed(worst.pct)}%।`,
      };
    }

    case 'machines': {
      const list = roadMachines(ctx);
      if (!list.length) return { en: 'There are no machines on this road.', bn: 'এই রাস্তায় কোনো মেশিন নেই।' };
      const working = list.filter((m) => m.status === 'working').length;
      const idle = list.filter((m) => m.status === 'idle').length;
      const broken = list.filter((m) => m.status === 'repair');
      const low = list.filter((m) => m.fuelPct < 25);
      const brokenText = broken.length ? { en: ` Broken: ${list_(broken.map((m) => machineLabel(m).en), 'en')}.`, bn: ` নষ্ট: ${list_(broken.map((m) => machineLabel(m).bn), 'bn')}।` } : { en: '', bn: '' };
      const lowText = low.length ? { en: ` Low on fuel: ${list_(low.map((m) => machineLabel(m).en), 'en')}.`, bn: ` জ্বালানি কম: ${list_(low.map((m) => machineLabel(m).bn), 'bn')}।` } : { en: '', bn: '' };
      return {
        en: `${en.num(working)} ${working === 1 ? 'machine is' : 'machines are'} working and ${en.num(idle)} ${idle === 1 ? 'is' : 'are'} idle.${brokenText.en}${lowText.en}`,
        bn: `${bn.num(working)}টি মেশিন চলছে, ${bn.num(idle)}টি বসে আছে।${brokenText.bn}${lowText.bn}`,
      };
    }

    case 'health': {
      if (w) {
        const mine = healthToday(ctx, now).find((r) => r.workerId === w.id);
        const told = mine
          ? { en: ` Today you said you are ${mine.status === 'fit' ? 'well' : mine.status === 'sick' ? 'sick' : 'hurt'}.`, bn: ` আজ আপনি জানিয়েছেন: ${mine.status === 'fit' ? 'ভালো আছেন' : mine.status === 'sick' ? 'অসুস্থ' : 'আহত'}।` }
          : { en: ' You have not told us today.', bn: ' আজ আপনি এখনো জানাননি।' };
        const days = sickDays(ctx.health, w.id, new Date(now));
        const run =
          days.streak > 0
            ? { en: ` You have been unwell for ${en.num(days.streak)} ${days.streak === 1 ? 'day' : 'days'} in a row.`, bn: ` আপনি টানা ${bn.num(days.streak)} দিন ধরে ভালো নেই।` }
            : { en: '', bn: '' };
        const month = days.month > 0 ? { en: ` In the last 30 days you were unwell on ${en.num(days.month)} days.`, bn: ` গত ৩০ দিনে ${bn.num(days.month)} দিন ভালো ছিলেন না।` } : { en: '', bn: '' };
        return {
          en: `Tap My health, then tap how you feel: well, sick or hurt. You can also say it with your voice. The supervisor sees it.${told.en}${run.en}${month.en}`,
          bn: `"আমার স্বাস্থ্য" চাপুন, তারপর কেমন আছেন চাপুন: ভালো, অসুস্থ বা আহত। চাইলে কণ্ঠেও বলতে পারেন। সুপারভাইজার দেখতে পাবেন।${told.bn}${run.bn}${month.bn}`,
        };
      }
      const today = healthToday(ctx, now).filter((r) => r.status !== 'fit');
      if (!today.length) return { en: 'No one has said they are sick or hurt today.', bn: 'আজ কেউ অসুস্থ বা আহত বলে জানাননি।' };
      const people = today.map((r) => ({ r, w: ctx.workers.find((x) => x.id === r.workerId) })).filter((x) => x.w);
      return {
        en: `${people.map(({ r, w }) => `${w!.name} is ${r.status === 'sick' ? 'sick' : 'hurt'}${r.note ? `: ${r.note}` : ''}`).join('. ')}. Give them lighter work or let them rest.`,
        bn: `${people.map(({ r, w }) => `${w!.nameBn} ${r.status === 'sick' ? 'অসুস্থ' : 'আহত'}${r.note ? `: ${r.note}` : ''}`).join('। ')}। তাদের হালকা কাজ দিন বা বিশ্রাম দিন।`,
      };
    }

    case 'help':
      if (ctx.role === 'admin')
        return {
          en: 'Overview shows the road and charts. Pay is for approving pay lists. Machines shows every machine. Complaints and Raises are requests from workers. Records has every shift and a CSV download. Tap the road name at the top to change road.',
          bn: '"সারসংক্ষেপ"-এ রাস্তা আর চার্ট। "মজুরি"-তে তালিকা অনুমোদন। "মেশিন"-এ সব মেশিন। "অভিযোগ" আর "বেতন বৃদ্ধি"-তে শ্রমিকদের আবেদন। "রেকর্ড"-এ সব শিফট আর CSV ডাউনলোড। রাস্তা বদলাতে উপরে রাস্তার নামে চাপ দিন।',
        };
      if (ctx.role === 'supervisor')
        return {
          en: "Start the day by choosing the crew and materials. I remind you about rest and snacks. Machines shows fuel and repairs. Crew health shows who is sick. At the end, finish the shift and send the pay list.",
          bn: 'দিনের শুরুতে শ্রমিক আর মাল বাছাই করুন। বিশ্রাম আর নাস্তার সময় আমি মনে করিয়ে দিই। "মেশিন"-এ জ্বালানি আর মেরামত। "শ্রমিকদের স্বাস্থ্য"-এ কে অসুস্থ। শেষে শিফট শেষ করে মজুরির তালিকা পাঠান।',
        };
      return {
        en: 'My money shows your pay. My health lets you tell the supervisor how you feel. More pay lets you ask for a raise. Complain lets you report a problem by voice.',
        bn: '"আমার টাকা"-য় আপনার মজুরি। "আমার স্বাস্থ্য"-এ কেমন আছেন জানান। "বেতন বাড়ান"-এ বেতন বাড়ানোর আবেদন। "অভিযোগ"-এ কণ্ঠে সমস্যা জানান।',
      };
  }
}

export interface Tip {
  /** Changes when the advice changes, so a tip the person closed stays closed until there is something new. */
  key: string;
  text: Text;
  tone: 'info' | 'warn' | 'alert';
}

/** What to do now, and when. Shown in the bubble beside Apa's button. */
export function nextStep(ctx: ApaContext): Tip {
  const now = ctx.now ?? Date.now();
  const shift = activeShift(ctx);
  const st = shift ? getBreakStatus(shift.startedAt, shift.breaks, now) : null;
  const min = st ? Math.max(1, Math.ceil(st.msUntilNext / 60_000)) : 0;
  const breakName = (t: 'rest' | 'snack') => (t === 'rest' ? { en: 'rest', bn: 'বিশ্রাম' } : { en: 'snack', bn: 'নাস্তা' });
  const unwell = healthToday(ctx, now).filter((r) => r.status !== 'fit');
  const hour = new Date(now).getHours();

  if (ctx.role === 'worker' && ctx.worker) {
    const w = ctx.worker;
    const mine = healthToday(ctx, now).find((r) => r.workerId === w.id);
    if (st?.due) return { key: `due-${st.due}-${shift!.breaks.length}`, tone: 'alert', text: { en: `It is ${breakName(st.due).en} time now. Drink water and sit in the shade.`, bn: `এখন ${st.due === 'rest' ? 'বিশ্রামের' : 'নাস্তার'} সময়। পানি খান, ছায়ায় বসুন।` } };
    if (!mine) return { key: 'health-ask', tone: 'warn', text: { en: 'Good day! Tell your supervisor how you feel today. Tap My health.', bn: 'শুভ দিন! আজ কেমন আছেন সুপারভাইজারকে জানান। "আমার স্বাস্থ্য" চাপুন।' } };
    if (st) return { key: 'next-break', tone: 'info', text: { en: `Next ${breakName(st.nextType).en} in ${en.num(min)} minutes. Keep drinking water.`, bn: `পরের ${breakName(st.nextType).bn} ${bn.num(min)} মিনিট পরে। পানি খেতে থাকুন।` } };
    const raise = ctx.raises.filter((r) => r.workerId === w.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).pop();
    if (raise?.status === 'approved') return { key: `raise-${raise.id}`, tone: 'info', text: { en: `Good news! Your daily pay is now ${en.num(raise.requestedRate)} taka.`, bn: `সুখবর! আপনার দৈনিক মজুরি এখন ${bn.num(raise.requestedRate)} টাকা।` } };
    return { key: 'worker-idle', tone: 'info', text: { en: 'Ask me about your money, your breaks or your complaint. Tap the microphone and speak.', bn: 'আপনার টাকা, বিরতি বা অভিযোগ নিয়ে জিজ্ঞেস করুন। মাইকে চাপ দিয়ে বলুন।' } };
  }

  if (ctx.role === 'supervisor') {
    const broken = roadMachines(ctx).filter((m) => m.status === 'repair');
    const low = roadMachines(ctx).filter((m) => m.fuelPct < 25 && m.status !== 'repair');
    if (st?.due)
      return {
        key: `due-${st.due}-${shift!.breaks.length}`,
        tone: 'alert',
        text: st.due === 'rest'
          ? { en: 'Rest time now! Give everyone 15 minutes in the shade with water. Then tap "Rest given".', bn: 'এখন বিশ্রামের সময়! সবাইকে ১৫ মিনিট ছায়ায় পানি দিন। তারপর "বিশ্রাম দিয়েছি" চাপুন।' }
          : { en: 'Snack time now! Give tea, bread or bananas. Then tap "Snacks given".', bn: 'এখন নাস্তার সময়! চা, রুটি বা কলা দিন। তারপর "নাস্তা দিয়েছি" চাপুন।' },
      };
    if (unwell.length) {
      const names = unwell.map((r) => ctx.workers.find((x) => x.id === r.workerId)).filter((x): x is Worker => !!x);
      return {
        key: `unwell-${unwell.map((r) => r.id).join('-')}`,
        tone: 'warn',
        text: { en: `${list_(names.map((x) => x.name), 'en')} said they are not well today. Check on them before work.`, bn: `${list_(names.map((x) => x.nameBn), 'bn')} আজ ভালো নেই বলে জানিয়েছেন। কাজের আগে খোঁজ নিন।` },
      };
    }
    if (broken.length || low.length) {
      const m = broken[0] ?? low[0];
      return {
        key: `machine-${m.id}-${m.status}-${m.fuelPct}`,
        tone: 'warn',
        text: m.status === 'repair'
          ? { en: `${machineLabel(m).en} is broken. Call the mechanic, then mark it fixed in Machines.`, bn: `${machineLabel(m).bn} নষ্ট। মিস্ত্রি ডাকুন, তারপর "মেশিন"-এ ঠিক করা হয়েছে চিহ্ন দিন।` }
          : { en: `${machineLabel(m).en} has only ${m.fuelPct}% fuel. Fill it before work stops.`, bn: `${machineLabel(m).bn}-এ মাত্র ${bn.num(m.fuelPct)}% জ্বালানি। কাজ থামার আগে তেল দিন।` },
      };
    }
    if (!shift)
      return hour < 12
        ? { key: 'start', tone: 'info', text: { en: 'Good morning! Start today\'s work: tap the workers who came, then the materials.', bn: 'শুভ সকাল! আজকের কাজ শুরু করুন: যারা এসেছেন তাদের চাপুন, তারপর মালামাল।' } }
        : { key: 'start-late', tone: 'info', text: { en: 'No shift is running. Tap the workers who came to start work.', bn: 'এখন কোনো শিফট চলছে না। কাজ শুরু করতে যারা এসেছেন তাদের চাপুন।' } };
    const hoursOn = (now - new Date(shift.startedAt).getTime()) / 3_600_000;
    if (hoursOn >= 9 || hour >= 17)
      return { key: 'finish', tone: 'warn', text: { en: 'It is time to finish. Tap "Finish work", count the workers and send the pay list.', bn: 'কাজ শেষ করার সময়। "কাজ শেষ করুন" চাপুন, শ্রমিক গুনুন, মজুরির তালিকা পাঠান।' } };
    return { key: 'next-break', tone: 'info', text: { en: `Next ${breakName(st!.nextType).en} in ${en.num(min)} minutes. I will tell you when.`, bn: `পরের ${breakName(st!.nextType).bn} ${bn.num(min)} মিনিট পরে। সময় হলে আমি বলব।` } };
  }

  const pending = completed(ctx).filter((s) => s.payrollStatus === 'pending');
  if (pending.length) return { key: `pay-${pending.map((s) => s.id).join('-')}`, tone: 'warn', text: { en: `${en.num(pending.length)} ${pending.length === 1 ? 'pay list is' : 'pay lists are'} waiting. Open Pay and approve it so workers get paid.`, bn: `${bn.num(pending.length)}টি মজুরির তালিকা অপেক্ষায়। শ্রমিকরা যেন টাকা পান, "মজুরি" খুলে অনুমোদন দিন।` } };
  const open = ctx.complaints.filter((c) => c.status === 'open').length;
  if (open) return { key: `complaints-${open}`, tone: 'warn', text: { en: `${en.num(open)} new ${open === 1 ? 'complaint is' : 'complaints are'} not opened yet. Open Complaints.`, bn: `${bn.num(open)}টি নতুন অভিযোগ এখনো খোলা হয়নি। "অভিযোগ" খুলুন।` } };
  const broken = roadMachines(ctx).filter((m) => m.status === 'repair');
  if (broken.length) return { key: `broken-${broken.map((m) => m.id).join('-')}`, tone: 'warn', text: { en: `${list_(broken.map((m) => machineLabel(m).en), 'en')} ${broken.length === 1 ? 'is' : 'are'} broken on this road.`, bn: `এই রাস্তায় ${list_(broken.map((m) => machineLabel(m).bn), 'bn')} নষ্ট।` } };
  return { key: 'admin-idle', tone: 'info', text: { en: `${ctx.road.name.en} is ${en.fixed(roadDone(ctx))}% done. Ask me anything.`, bn: `${ctx.road.name.bn}-এর ${bn.fixed(roadDone(ctx))}% শেষ। যা খুশি জিজ্ঞেস করুন।` } };
}
