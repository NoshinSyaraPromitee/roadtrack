import type { Worker } from '@/core/types';
import { getBreakStatus } from '@/core/reminderPolicy';
import type { Text } from '@/shared/i18n';
import type { ApaContext } from './types';
import * as h from './helpers';

export interface Tip {
  key: string;
  text: Text;
  tone: 'info' | 'warn' | 'alert';
}

export function nextStep(ctx: ApaContext): Tip {
  const now = ctx.now ?? Date.now();
  const shift = h.activeShift(ctx);
  const st = shift ? getBreakStatus(shift.startedAt, shift.breaks, now) : null;
  const min = st ? Math.max(1, Math.ceil(st.msUntilNext / 60_000)) : 0;
  const breakName = (t: 'rest' | 'snack') => (t === 'rest' ? { en: 'rest', bn: 'বিশ্রাম' } : { en: 'snack', bn: 'নাস্তা' });
  const unwell = h.healthToday(ctx, now).filter((r) => r.status !== 'fit');
  const hour = new Date(now).getHours();

  if (ctx.role === 'worker' && ctx.worker) {
    const w = ctx.worker;
    const mine = h.healthToday(ctx, now).find((r) => r.workerId === w.id);
    if (st?.due) return { key: `due-${st.due}-${shift!.breaks.length}`, tone: 'alert', text: { en: `It is ${breakName(st.due).en} time now. Drink water and sit in the shade.`, bn: `এখন ${st.due === 'rest' ? 'বিশ্রামের' : 'নাস্তার'} সময়। পানি খান, ছায়ায় বসুন।` } };
    if (!mine) return { key: 'health-ask', tone: 'warn', text: { en: 'Good day! Tell your supervisor how you feel today. Tap My health.', bn: 'শুভ দিন! আজ কেমন আছেন সুপারভাইজারকে জানান। "আমার স্বাস্থ্য" চাপুন।' } };
    if (st) return { key: 'next-break', tone: 'info', text: { en: `Next ${breakName(st.nextType).en} in ${h.en.num(min)} minutes. Keep drinking water.`, bn: `পরের ${breakName(st.nextType).bn} ${h.bn.num(min)} মিনিট পরে। পানি খেতে থাকুন।` } };
    const raise = ctx.raises.filter((r) => r.workerId === w.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).pop();
    if (raise?.status === 'approved') return { key: `raise-${raise.id}`, tone: 'info', text: { en: `Good news! Your daily pay is now ${h.en.num(raise.requestedRate)} taka.`, bn: `সুখবর! আপনার দৈনিক মজুরি এখন ${h.bn.num(raise.requestedRate)} টাকা।` } };
    return { key: 'worker-idle', tone: 'info', text: { en: 'Ask me about your money, your breaks or your complaint. Tap the microphone and speak.', bn: 'আপনার টাকা, বিরতি বা অভিযোগ নিয়ে জিজ্ঞেস করুন। মাইকে চাপ দিয়ে বলুন।' } };
  }

  if (ctx.role === 'supervisor') {
    const broken = h.roadMachines(ctx).filter((m) => m.status === 'repair');
    const low = h.roadMachines(ctx).filter((m) => m.fuelPct < 25 && m.status !== 'repair');
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
        text: { en: `${h.list_(names.map((x) => x.name), 'en')} said they are not well today. Check on them before work.`, bn: `${h.list_(names.map((x) => x.nameBn), 'bn')} আজ ভালো নেই বলে জানিয়েছেন। কাজের আগে খোঁজ নিন।` },
      };
    }
    if (broken.length || low.length) {
      const m = broken[0] ?? low[0];
      return {
        key: `machine-${m.id}-${m.status}-${m.fuelPct}`,
        tone: 'warn',
        text: m.status === 'repair'
          ? { en: `${h.machineLabel(m).en} is broken. Call the mechanic, then mark it fixed in Machines.`, bn: `${h.machineLabel(m).bn} নষ্ট। মিস্ত্রি ডাকুন, তারপর "মেশিন"-এ ঠিক করা হয়েছে চিহ্ন দিন।` }
          : { en: `${h.machineLabel(m).en} has only ${m.fuelPct}% fuel. Fill it before work stops.`, bn: `${h.machineLabel(m).bn}-এ মাত্র ${h.bn.num(m.fuelPct)}% জ্বালানি। কাজ থামার আগে তেল দিন।` },
      };
    }
    if (!shift)
      return hour < 12
        ? { key: 'start', tone: 'info', text: { en: 'Good morning! Start today\'s work: tap the workers who came, then the materials.', bn: 'শুভ সকাল! আজকের কাজ শুরু করুন: যারা এসেছেন তাদের চাপুন, তারপর মালামাল।' } }
        : { key: 'start-late', tone: 'info', text: { en: 'No shift is running. Tap the workers who came to start work.', bn: 'এখন কোনো শিফট চলছে না। কাজ শুরু করতে যারা এসেছেন তাদের চাপুন।' } };
    const hoursOn = (now - new Date(shift.startedAt).getTime()) / 3_600_000;
    if (hoursOn >= 9 || hour >= 17)
      return { key: 'finish', tone: 'warn', text: { en: 'It is time to finish. Tap "Finish work", count the workers and send the pay list.', bn: 'কাজ শেষ করার সময়। "কাজ শেষ করুন" চাপুন, শ্রমিক গুনুন, মজুরির তালিকা পাঠান।' } };
    return { key: 'next-break', tone: 'info', text: { en: `Next ${breakName(st!.nextType).en} in ${h.en.num(min)} minutes. I will tell you when.`, bn: `পরের ${breakName(st!.nextType).bn} ${h.bn.num(min)} মিনিট পরে। সময় হলে আমি বলব।` } };
  }

  const pending = h.completed(ctx).filter((s) => s.payrollStatus === 'pending');
  if (pending.length) return { key: `pay-${pending.map((s) => s.id).join('-')}`, tone: 'warn', text: { en: `${h.en.num(pending.length)} ${pending.length === 1 ? 'pay list is' : 'pay lists are'} waiting. Open Pay and approve it so workers get paid.`, bn: `${h.bn.num(pending.length)}টি মজুরির তালিকা অপেক্ষায়। শ্রমিকরা যেন টাকা পান, "মজুরি" খুলে অনুমোদন দিন।` } };
  const open = ctx.complaints.filter((c) => c.status === 'open').length;
  if (open) return { key: `complaints-${open}`, tone: 'warn', text: { en: `${h.en.num(open)} new ${open === 1 ? 'complaint is' : 'complaints are'} not opened yet. Open Complaints.`, bn: `${h.bn.num(open)}টি নতুন অভিযোগ এখনো খোলা হয়নি। "অভিযোগ" খুলুন।` } };
  const broken = h.roadMachines(ctx).filter((m) => m.status === 'repair');
  if (broken.length) return { key: `broken-${broken.map((m) => m.id).join('-')}`, tone: 'warn', text: { en: `${h.list_(broken.map((m) => h.machineLabel(m).en), 'en')} ${broken.length === 1 ? 'is' : 'are'} broken on this road.`, bn: `এই রাস্তায় ${h.list_(broken.map((m) => h.machineLabel(m).bn), 'bn')} নষ্ট।` } };
  return { key: 'admin-idle', tone: 'info', text: { en: `${ctx.road.name.en} is ${h.en.fixed(h.roadDone(ctx))}% done. Ask me anything.`, bn: `${ctx.road.name.bn}-এর ${h.bn.fixed(h.roadDone(ctx))}% শেষ। যা খুশি জিজ্ঞেস করুন।` } };
}
