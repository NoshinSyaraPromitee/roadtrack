import type { Worker } from '@/core/types';
import { COMPLAINT_CATEGORIES } from '@/core/catalog';
import { isOwnComplaint } from '@/core/complaints';
import { PAYROLL_RULES } from '@/core/payroll';
import { getBreakStatus } from '@/core/reminderPolicy';
import type { Text } from '@/shared/i18n';
import type { ApaContext, QuestionKey } from './types';
import * as h from './helpers';
import { answerSite } from './answersSite';

export function answerPerson(key: QuestionKey, ctx: ApaContext): Text | null {
  const w = ctx.worker;
  const now = ctx.now ?? Date.now();
  switch (key) {
    case 'intro':
      return {
        en: 'I am Apa, your helper on the road site. I read pay, breaks, requests and road progress from this app and tell you. I work without internet.',
        bn: 'আমি আপা, রাস্তার সাইটে আপনার সহকারী। এই অ্যাপ থেকে মজুরি, বিরতি, আবেদন আর রাস্তার অগ্রগতির খবর বলে দিই। আমি ইন্টারনেট ছাড়াই কাজ করি।',
      };

    case 'my_pay': {
      if (!w) return answerSite('pay_pending', ctx);
      const entries = ctx.shifts.filter((s) => s.status === 'completed').sort(h.byStart).flatMap((s) => {
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
          en: `You were not at work on ${h.en.date(last.s.startedAt)}, so there is no pay for that day. In total you have been paid ${h.en.num(paid)} taka, and you will get ${h.en.num(waiting)} taka after work.`,
          bn: `${h.bn.date(last.s.startedAt)} তারিখে আপনি কাজে ছিলেন না, তাই সেদিনের মজুরি নেই। মোট ${h.bn.num(paid)} টাকা পেয়েছেন, আর ${h.bn.num(waiting)} টাকা কাজের পরে পাবেন।`,
        };
      }
      const extra = last.line.welfareBonus > 0 ? h.both((i) => (i.lang === 'bn' ? ` এর মধ্যে ${i.num(last.line.welfareBonus)} টাকা বাড়তি সহায়তা।` : ` That includes ${i.num(last.line.welfareBonus)} taka extra help.`)) : { en: '', bn: '' };
      const cut = last.line.deduction > 0 ? h.both((i) => (i.lang === 'bn' ? ` আগে চলে যাওয়ায় ${i.num(last.line.deduction)} টাকা কাটা হয়েছে।` : ` ${i.num(last.line.deduction)} taka was cut because you left early.`)) : { en: '', bn: '' };
      return {
        en: `On ${h.en.date(last.s.startedAt)} you earned ${h.en.num(last.line.total)} taka, ${lastPaid ? 'and it is paid' : 'and you will get it after work'}.${extra.en}${cut.en} In total you have been paid ${h.en.num(paid)} taka, and you will get ${h.en.num(waiting)} taka after work.`,
        bn: `${h.bn.date(last.s.startedAt)} তারিখে আপনি ${h.bn.num(last.line.total)} টাকা আয় করেছেন, ${lastPaid ? 'টাকা দেওয়া হয়েছে' : 'কাজের পরে পাবেন'}।${extra.bn}${cut.bn} মোট ${h.bn.num(paid)} টাকা পেয়েছেন, আর ${h.bn.num(waiting)} টাকা কাজের পরে পাবেন।`,
      };
    }

    case 'daily_rate':
      if (!w) return answerPerson('extra_pay', ctx);
      return { en: `Your daily pay is ${h.en.num(w.dailyRate)} taka.`, bn: `আপনার দৈনিক মজুরি ${h.bn.num(w.dailyRate)} টাকা।` };

    case 'raise': {
      if (!w) {
        const pending = ctx.raises.filter((r) => r.status === 'pending');
        if (!pending.length) return { en: 'There are no raise requests waiting.', bn: 'কোনো বেতন বৃদ্ধির আবেদন অপেক্ষায় নেই।' };
        const names = pending.map((r) => ctx.workers.find((x) => x.id === r.workerId)).filter((x): x is Worker => !!x);
        return {
          en: `${h.en.num(pending.length)} raise requests are waiting, from ${h.list_(names.map((x) => x.name), 'en')}. Open the Raises tab to decide.`,
          bn: `${h.bn.num(pending.length)}টি বেতন বৃদ্ধির আবেদন অপেক্ষায়, ${h.list_(names.map((x) => x.nameBn), 'bn')}-এর কাছ থেকে। সিদ্ধান্ত দিতে "বেতন বৃদ্ধি" ট্যাব খুলুন।`,
        };
      }
      const mine = ctx.raises.filter((r) => r.workerId === w.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const last = mine[mine.length - 1];
      if (!last) return { en: 'You have not asked for a raise. Open More pay to ask.', bn: 'আপনি বেতন বাড়ানোর আবেদন করেননি। আবেদন করতে "বেতন বাড়ান" খুলুন।' };
      if (last.status === 'pending')
        return { en: `Your request for ${h.en.num(last.requestedRate)} taka a day is waiting for the office.`, bn: `দৈনিক ${h.bn.num(last.requestedRate)} টাকার আবেদনটি অফিসের অপেক্ষায় আছে।` };
      if (last.status === 'approved')
        return { en: `Good news! Your raise to ${h.en.num(last.requestedRate)} taka a day was approved.`, bn: `সুখবর! দৈনিক ${h.bn.num(last.requestedRate)} টাকায় বেতন বাড়ানো অনুমোদন হয়েছে।` };
      return { en: `The office said no to ${h.en.num(last.requestedRate)} taka a day. You can ask again.`, bn: `অফিস দৈনিক ${h.bn.num(last.requestedRate)} টাকার আবেদনে না করেছে। আপনি আবার আবেদন করতে পারেন।` };
    }

    case 'complaints': {
      if (!w) {
        const open = ctx.complaints.filter((c) => c.status === 'open').length;
        const checking = ctx.complaints.filter((c) => c.status === 'reviewing').length;
        if (!open && !checking) return { en: 'All complaints are solved.', bn: 'সব অভিযোগের সমাধান হয়েছে।' };
        return {
          en: `${h.en.num(open + checking)} complaints are not solved. ${h.en.num(open)} are not opened yet and ${h.en.num(checking)} are being checked.`,
          bn: `${h.bn.num(open + checking)}টি অভিযোগের সমাধান হয়নি। ${h.bn.num(open)}টি এখনো খোলা হয়নি, ${h.bn.num(checking)}টি দেখা হচ্ছে।`,
        };
      }
      const mine = ctx.complaints.filter((c) => isOwnComplaint(c, w.id, ctx.ownComplaintIds)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
      const shift = h.activeShift(ctx);
      if (!shift) return { en: 'No shift is running now, so there is no break timer.', bn: 'এখন কোনো শিফট চলছে না, তাই বিরতির সময় নেই।' };
      const st = getBreakStatus(shift.startedAt, shift.breaks, now);
      const name = { rest: { en: 'rest', bn: 'বিশ্রাম', of: 'বিশ্রামের' }, snack: { en: 'snack', bn: 'নাস্তা', of: 'নাস্তার' } };
      if (st.due) {
        return ctx.role === 'worker'
          ? { en: `It is ${name[st.due].en} time now. Ask your supervisor and drink water.`, bn: `এখন ${name[st.due].of} সময়। সুপারভাইজারকে বলুন, আর পানি খান।` }
          : { en: `It is ${name[st.due].en} time now. Let the crew sit in the shade with water.`, bn: `এখন ${name[st.due].of} সময়। সবাইকে পানি নিয়ে ছায়ায় বসতে দিন।` };
      }
      const min = Math.max(1, Math.ceil(st.msUntilNext / 60_000));
      return { en: `The next ${name[st.nextType].en} is in ${h.en.num(min)} minutes.`, bn: `পরের ${name[st.nextType].bn} ${h.bn.num(min)} মিনিট পরে।` };
    }

    case 'extra_pay':
      return {
        en: `Workers aged ${PAYROLL_RULES.seniorAge} or more get ${PAYROLL_RULES.seniorBonusPct}% extra. Sick or hurt workers get ${PAYROLL_RULES.healthBonusPct}% extra. Leaving early cuts ${PAYROLL_RULES.earlyLeaveCutPct}% of the day's pay.`,
        bn: `${h.bn.num(PAYROLL_RULES.seniorAge)} বছর বা বেশি বয়সীরা ${h.bn.num(PAYROLL_RULES.seniorBonusPct)}% বাড়তি পান। অসুস্থ বা আহত হলে ${h.bn.num(PAYROLL_RULES.healthBonusPct)}% বাড়তি। আগে চলে গেলে দিনের মজুরির ${h.bn.num(PAYROLL_RULES.earlyLeaveCutPct)}% কাটা যায়।`,
      };

    case 'how_complain':
      return {
        en: 'Tap Complain. Tap the person, tap what happened, then tap the microphone and tell it in your voice. You can hide your name.',
        bn: '"অভিযোগ" চাপুন। মানুষটির উপর চাপ দিন, কী হয়েছে তা চাপুন, তারপর মাইকে চাপ দিয়ে নিজের কণ্ঠে বলুন। চাইলে নাম গোপন রাখতে পারেন।',
      };
    default:
      return null;
  }
}
