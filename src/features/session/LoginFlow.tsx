import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Check, ClipboardCheck, HardHat, MapPin, Repeat } from 'lucide-react';
import type { Role } from '@/core/types';
import { RoadPicker, useRoad, useRoadStore } from '@/features/road';
import { PeoplePicker, shortName, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { ActionBar, Pictogram, RoadStrip } from '@/shared/ui';
import type { IconType, PictoShape, PictoTone } from '@/shared/ui';
import { useSession } from './store';

const ROLES: Array<{ role: Role; path: string; title: Text; desc: Text; cta: Text; icon: IconType; tone: PictoTone; shape: PictoShape }> = [
  {
    role: 'worker',
    path: '/worker',
    title: { en: 'Worker', bn: 'শ্রমিক' },
    desc: { en: 'See your pay, make a complaint, ask for a raise.', bn: 'মজুরি দেখুন, অভিযোগ করুন, বেতন বাড়ানোর আবেদন করুন।' },
    cta: { en: 'I am a worker', bn: 'আমি শ্রমিক' },
    icon: HardHat,
    tone: 'mark',
    shape: 'plate',
  },
  {
    role: 'supervisor',
    path: '/supervisor',
    title: { en: 'Supervisor', bn: 'সুপারভাইজার' },
    desc: { en: 'Start the shift, give breaks, count the workers.', bn: 'শিফট শুরু করুন, বিরতি দিন, শ্রমিক গুনুন।' },
    cta: { en: 'I am the supervisor', bn: 'আমি সুপারভাইজার' },
    icon: ClipboardCheck,
    tone: 'guide',
    shape: 'plate',
  },
  {
    role: 'admin',
    path: '/admin',
    title: { en: 'Head office', bn: 'প্রধান কার্যালয়' },
    desc: { en: 'Approve pay and follow the whole project.', bn: 'মজুরি অনুমোদন করুন, পুরো প্রকল্প দেখুন।' },
    cta: { en: 'Open the office view', bn: 'অফিসের পাতা খুলুন' },
    icon: Building2,
    tone: 'sign',
    shape: 'disc',
  },
];

export type LoginStep = 'road' | 'role' | 'name';

/** First the road, then who you are, then (for workers) your name. */
export function LoginFlow({ progress, onStepChange }: { progress: Record<string, number>; onStepChange?: (step: LoginStep) => void }) {
  const { t, tx } = useI18n();
  const { hint, say } = useSay();
  const login = useSession((s) => s.login);
  const workers = useWorkforce((s) => s.workers);
  const navigate = useNavigate();
  const road = useRoad();
  const setRoad = useRoadStore((s) => s.setRoad);
  const [step, setStepState] = useState<LoginStep>('road');
  const [picked, setPicked] = useState<string | null>(null);
  const me = workers.find((w) => w.id === picked);

  const setStep = (next: LoginStep) => {
    setStepState(next);
    onStepChange?.(next);
    window.scrollTo({ top: 0 });
  };

  const enter = (role: Role, path: string, workerId: string | null = null) => {
    login(role, workerId);
    navigate(path);
  };

  if (step === 'road') {
    return (
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="font-sign text-3xl sm:text-5xl">{t('Which road?', 'কোন রাস্তা?')}</h1>
          <SpeakButton text={{ en: 'Which road are you working on? Tap one.', bn: 'আপনি কোন রাস্তায় কাজ করছেন? একটিতে চাপ দিন।' }} size="lg" />
        </div>
        <p className="mb-5 text-ink-soft sm:text-lg">{t('Choose the road you are working on today.', 'আজ যে রাস্তায় কাজ করছেন সেটি বেছে নিন।')}</p>
        <RoadPicker
          value={road.id}
          progress={progress}
          onPick={(r) => {
            setRoad(r.id);
            setStep('role');
          }}
        />
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="pb-32">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="font-sign text-3xl sm:text-5xl">{t('Tap your name', 'আপনার নামে চাপ দিন')}</h1>
          <SpeakButton
            text={{ en: 'Tap your name. The phone will say the name you tapped.', bn: 'আপনার নামে চাপ দিন। চাপ দিলে ফোন নামটি বলে দেবে।' }}
            size="lg"
          />
        </div>
        <p className="mb-5 text-ink-soft sm:text-lg">{t('Each person has their own colour and work sign.', 'প্রত্যেকের আলাদা রং ও কাজের চিহ্ন আছে।')}</p>
        <PeoplePicker people={workers} selected={picked ? [picked] : []} onPick={setPicked} size={80} />
        <ActionBar
          onBack={() => {
            setPicked(null);
            setStep('role');
          }}
          onNext={() => {
            if (me) enter('worker', '/worker', me.id);
            else say({ en: 'Tap your name first', bn: 'আগে আপনার নামে চাপ দিন' });
          }}
          nextIcon={Check}
          nextLabel={me ? t(`Yes, I am ${shortName(me, 'en')}`, `হ্যাঁ, আমি ${shortName(me, 'bn')}`) : t('Tap your name', 'আপনার নামে চাপ দিন')}
        />
      </div>
    );
  }

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-guide-600 p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute inset-2 rounded-[20px] border-2 border-white/85" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sign text-3xl leading-[1.05] sm:text-5xl">{tx(road.name)}</p>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-lg text-white/90">
                <MapPin className="h-5 w-5 text-mark-400" />
                {tx(road.from)}
                <ArrowRight className="h-4 w-4" />
                {tx(road.to)}, {tx(road.area)}
              </p>
            </div>
            <button type="button" onClick={() => setStep('road')} className="inline-flex items-center gap-1.5 py-2 font-semibold text-mark-300 hover:text-white">
              <Repeat className="h-5 w-5" />
              {t('Change road', 'রাস্তা বদলান')}
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-white p-3 text-ink sm:p-4">
            <RoadStrip progress={progress[road.id] ?? 0} lengthKm={road.lengthKm} size="lg" />
          </div>
        </div>
      </section>
      <div className="mb-5 flex items-center gap-3">
        <h1 className="font-sign text-3xl sm:text-5xl">{t('Who are you?', 'আপনি কে?')}</h1>
        <SpeakButton text={{ en: 'Who are you? Choose one.', bn: 'আপনি কে? একটি বেছে নিন।' }} size="lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {ROLES.map((r) => (
          <div
            key={r.role}
            className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 rounded-3xl border-2 border-line bg-white p-4 transition hover:border-guide-600 md:flex md:flex-col md:p-6 md:text-center"
          >
            <span className="md:hidden">
              <Pictogram icon={r.icon} tone={r.tone} shape={r.shape} size={64} />
            </span>
            <span className="hidden md:block">
              <Pictogram icon={r.icon} tone={r.tone} shape={r.shape} size={88} />
            </span>
            <div className="min-w-0 md:mt-4 md:flex-1">
              <h2 className="font-sign text-3xl leading-tight">{tx(r.title)}</h2>
              <p className="mt-1 text-ink-soft">{tx(r.desc)}</p>
            </div>
            <SpeakButton text={{ en: `${r.title.en}. ${r.desc.en}`, bn: `${r.title.bn}। ${r.desc.bn}` }} className="relative z-10 self-start md:absolute md:right-4 md:top-4" />
            <button
              type="button"
              onClick={() => {
                hint(r.title);
                if (r.role === 'worker') setStep('name');
                else enter(r.role, r.path);
              }}
              className="col-span-3 mt-4 h-14 w-full rounded-2xl bg-guide-600 text-lg font-semibold text-white shadow-[0_3px_0_0_var(--color-guide-800)] transition after:absolute after:inset-0 after:rounded-3xl hover:bg-guide-700 active:translate-y-[2px] active:shadow-none md:mt-5"
            >
              {tx(r.cta)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
