import { MATERIAL_BY_KEY, MATERIALS } from '@/core/catalog';
import { PAYROLL_RULES } from '@/core/payroll';
import { sickDays } from '@/core/health';
import { pctToKm } from '@/core/roads';
import type { Text } from '@/shared/i18n';
import type { ApaContext, QuestionKey } from './types';
import * as h from './helpers';

export function answerSite(key: QuestionKey, ctx: ApaContext): Text | null {
  const w = ctx.worker;
  const now = ctx.now ?? Date.now();
  switch (key) {
    case 'shift_now': {
      const shift = h.activeShift(ctx);
      if (!shift) return { en: 'No shift is running. Choose who came, add materials and tap Start work.', bn: 'এখন কোনো শিফট চলছে না। কে এসেছে বাছাই করুন, মাল দিন, তারপর "কাজ শুরু করুন" চাপুন।' };
      const hours = Math.floor((now - new Date(shift.startedAt).getTime()) / 3_600_000);
      const mins = Math.floor(((now - new Date(shift.startedAt).getTime()) % 3_600_000) / 60_000);
      return {
        en: `Work started at ${h.en.time(shift.startedAt)} at ${shift.site.en}, ${h.en.num(hours)} hours ${h.en.num(mins)} minutes ago. ${h.en.num(shift.attendance.length)} workers are on site. ${h.en.fixed(pctToKm(shift.startProgress, ctx.road), 2)} km of the road was done this morning.`,
        bn: `${h.bn.time(shift.startedAt)}-এ ${shift.site.bn}-এ কাজ শুরু হয়েছে, ${h.bn.num(hours)} ঘণ্টা ${h.bn.num(mins)} মিনিট আগে। সাইটে ${h.bn.num(shift.attendance.length)} জন শ্রমিক। সকালে রাস্তার ${h.bn.fixed(pctToKm(shift.startProgress, ctx.road), 2)} কিমি কাজ হয়েছিল।`,
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
      const shift = h.activeShift(ctx);
      const pool = shift ? ctx.workers.filter((x) => shift.attendance.some((a) => a.workerId === x.id)) : ctx.workers;
      const elders = pool.filter((x) => x.age >= PAYROLL_RULES.seniorAge);
      if (!elders.length) return { en: 'No older workers today. Still give water and shade at every break.', bn: 'আজ কোনো বয়স্ক শ্রমিক নেই। তবুও প্রতি বিরতিতে পানি আর ছায়া দিন।' };
      return {
        en: `${h.list_(elders.map((x) => x.name), 'en')} ${elders.length > 1 ? 'are' : 'is'} ${PAYROLL_RULES.seniorAge} or older. Check on them first at every break, and mark anyone sick when you finish.`,
        bn: `${h.list_(elders.map((x) => x.nameBn), 'bn')}-এর বয়স ${h.bn.num(PAYROLL_RULES.seniorAge)} বা বেশি। প্রতি বিরতিতে আগে তাদের খোঁজ নিন, আর শেষে কেউ অসুস্থ হলে চিহ্ন দিন।`,
      };
    }

    case 'progress': {
      const p = h.roadDone(ctx);
      const done = h.completed(ctx);
      const last = done[done.length - 1];
      const gain = last ? (last.endProgress ?? last.startProgress) - last.startProgress : 0;
      const km = pctToKm(p, ctx.road);
      const gainKm = pctToKm(gain, ctx.road);
      return {
        en: `${ctx.road.name.en} is ${h.en.fixed(p)}% done. That is ${h.en.fixed(km, 2)} of ${h.en.fixed(ctx.road.lengthKm)} kilometres.${last ? ` The last shift added ${h.en.fixed(gainKm, 2)} km.` : ''}`,
        bn: `${ctx.road.name.bn}-এর ${h.bn.fixed(p)}% কাজ হয়েছে। মানে ${h.bn.fixed(ctx.road.lengthKm)} কিলোমিটারের মধ্যে ${h.bn.fixed(km, 2)} কিলোমিটার।${last ? ` শেষ শিফটে ${h.bn.fixed(gainKm, 2)} কিমি হয়েছে।` : ''}`,
      };
    }

    case 'pay_pending': {
      const pending = h.completed(ctx).filter((s) => s.payrollStatus === 'pending');
      if (!pending.length) return { en: 'All pay lists are approved. Nothing is waiting.', bn: 'সব মজুরির তালিকা অনুমোদন হয়েছে। কিছু অপেক্ষায় নেই।' };
      const total = pending.reduce((t, s) => t + s.payroll.reduce((x, l) => x + l.total, 0), 0);
      return ctx.role === 'admin'
        ? { en: `${h.en.num(pending.length)} pay lists are waiting for your approval, ${h.en.num(total)} taka in total. Open the Pay tab.`, bn: `${h.bn.num(pending.length)}টি মজুরির তালিকা আপনার অনুমোদনের অপেক্ষায়, মোট ${h.bn.num(total)} টাকা। "মজুরি" ট্যাব খুলুন।` }
        : { en: `${h.en.num(pending.length)} pay lists, ${h.en.num(total)} taka in total, are waiting for the head office.`, bn: `${h.bn.num(pending.length)}টি মজুরির তালিকা, মোট ${h.bn.num(total)} টাকা, প্রধান কার্যালয়ের অপেক্ষায়।` };
    }

    case 'waste': {
      const done = h.completed(ctx);
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
        en: `About ${h.en.fixed(all)}% of all material was wasted. The most waste is ${name.en.toLowerCase()}, at ${h.en.fixed(worst.pct)}%.`,
        bn: `সব মালের প্রায় ${h.bn.fixed(all)}% নষ্ট হয়েছে। সবচেয়ে বেশি নষ্ট ${name.bn}, ${h.bn.fixed(worst.pct)}%।`,
      };
    }

    case 'machines': {
      const list = h.roadMachines(ctx);
      if (!list.length) return { en: 'There are no machines on this road.', bn: 'এই রাস্তায় কোনো মেশিন নেই।' };
      const working = list.filter((m) => m.status === 'working').length;
      const idle = list.filter((m) => m.status === 'idle').length;
      const broken = list.filter(h.isBroken);
      const low = list.filter(h.fuelLow);
      const brokenText = broken.length ? { en: ` Broken: ${h.list_(broken.map((m) => h.machineLabel(m).en), 'en')}.`, bn: ` নষ্ট: ${h.list_(broken.map((m) => h.machineLabel(m).bn), 'bn')}।` } : { en: '', bn: '' };
      const lowText = low.length ? { en: ` Low on fuel: ${h.list_(low.map((m) => h.machineLabel(m).en), 'en')}.`, bn: ` জ্বালানি কম: ${h.list_(low.map((m) => h.machineLabel(m).bn), 'bn')}।` } : { en: '', bn: '' };
      return {
        en: `${h.en.num(working)} ${working === 1 ? 'machine is' : 'machines are'} working and ${h.en.num(idle)} ${idle === 1 ? 'is' : 'are'} idle.${brokenText.en}${lowText.en}`,
        bn: `${h.bn.num(working)}টি মেশিন চলছে, ${h.bn.num(idle)}টি বসে আছে।${brokenText.bn}${lowText.bn}`,
      };
    }

    case 'health': {
      if (w) {
        const mine = h.healthToday(ctx, now).find((r) => r.workerId === w.id);
        const told = mine
          ? { en: ` Today you said you are ${mine.status === 'fit' ? 'well' : mine.status === 'sick' ? 'sick' : 'hurt'}.`, bn: ` আজ আপনি জানিয়েছেন: ${mine.status === 'fit' ? 'ভালো আছেন' : mine.status === 'sick' ? 'অসুস্থ' : 'আহত'}।` }
          : { en: ' You have not told us today.', bn: ' আজ আপনি এখনো জানাননি।' };
        const days = sickDays(ctx.health, w.id, new Date(now));
        const run =
          days.streak > 0
            ? { en: ` You have been unwell for ${h.en.num(days.streak)} ${days.streak === 1 ? 'day' : 'days'} in a row.`, bn: ` আপনি টানা ${h.bn.num(days.streak)} দিন ধরে ভালো নেই।` }
            : { en: '', bn: '' };
        const month = days.month > 0 ? { en: ` In the last 30 days you were unwell on ${h.en.num(days.month)} days.`, bn: ` গত ৩০ দিনে ${h.bn.num(days.month)} দিন ভালো ছিলেন না।` } : { en: '', bn: '' };
        return {
          en: `Tap My health, then tap how you feel: well, sick or hurt. You can also say it with your voice. The supervisor sees it.${told.en}${run.en}${month.en}`,
          bn: `"আমার স্বাস্থ্য" চাপুন, তারপর কেমন আছেন চাপুন: ভালো, অসুস্থ বা আহত। চাইলে কণ্ঠেও বলতে পারেন। সুপারভাইজার দেখতে পাবেন।${told.bn}${run.bn}${month.bn}`,
        };
      }
      const today = h.healthToday(ctx, now).filter((r) => r.status !== 'fit');
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
    default:
      return null;
  }
}
