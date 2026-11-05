import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check } from 'lucide-react';
import type { Role } from '@/core/types';
import { SEED_WORKERS, SUPERVISOR } from '@/core/seed';
import { Face, PeoplePicker, shortName, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { ActionBar, Pictogram } from '@/shared/ui';
import { useSession } from './store';

const ROLES: Array<{ role: Role; path: string; title: Text; desc: Text; cta: Text }> = [
  {
    role: 'worker',
    path: '/worker',
    title: { en: 'Worker', bn: 'শ্রমিক' },
    desc: { en: 'See your pay, make a complaint, ask for a raise.', bn: 'মজুরি দেখুন, অভিযোগ করুন, বেতন বাড়ানোর আবেদন করুন।' },
    cta: { en: 'I am a worker', bn: 'আমি শ্রমিক' },
  },
  {
    role: 'supervisor',
    path: '/supervisor',
    title: { en: 'Supervisor', bn: 'সুপারভাইজার' },
    desc: { en: 'Start the shift, give breaks, count the workers.', bn: 'শিফট শুরু করুন, বিরতি দিন, শ্রমিক গুনুন।' },
    cta: { en: 'I am the supervisor', bn: 'আমি সুপারভাইজার' },
  },
  {
    role: 'admin',
    path: '/admin',
    title: { en: 'Head office', bn: 'প্রধান কার্যালয়' },
    desc: { en: 'Approve pay and follow the whole project.', bn: 'মজুরি অনুমোদন করুন, পুরো প্রকল্প দেখুন।' },
    cta: { en: 'Open the office view', bn: 'অফিসের পাতা খুলুন' },
  },
];

function RoleArt({ role }: { role: Role }) {
  if (role === 'admin') return <Pictogram icon={Building2} tone="sign" shape="disc" size={84} />;
  return <Face look={role === 'worker' ? SEED_WORKERS[1].look : SUPERVISOR.look} size={84} className="block rounded-full ring-4 ring-paper" />;
}

export type LoginStep = 'role' | 'face';

export function LoginFlow({ onStepChange }: { onStepChange?: (step: LoginStep) => void }) {
  const { t, tx } = useI18n();
  const { hint, say } = useSay();
  const login = useSession((s) => s.login);
  const workers = useWorkforce((s) => s.workers);
  const navigate = useNavigate();
  const [step, setStepState] = useState<LoginStep>('role');
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

  if (step === 'face') {
    return (
      <div className="pb-32">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-sign text-4xl sm:text-5xl">{t('Tap your picture', 'আপনার ছবিতে চাপ দিন')}</h1>
          <SpeakButton text={{ en: 'Tap your picture', bn: 'আপনার ছবিতে চাপ দিন' }} size="lg" />
        </div>
        <PeoplePicker people={workers} selected={picked ? [picked] : []} onPick={setPicked} size={84} />
        <ActionBar
          onBack={() => {
            setPicked(null);
            setStep('role');
          }}
          onNext={() => {
            if (me) enter('worker', '/worker', me.id);
            else say({ en: 'Tap your picture first', bn: 'আগে আপনার ছবিতে চাপ দিন' });
          }}
          nextIcon={Check}
          nextLabel={me ? t(`Yes, I am ${shortName(me, 'en')}`, `হ্যাঁ, আমি ${shortName(me, 'bn')}`) : t('Tap your picture', 'আপনার ছবিতে চাপ দিন')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <h1 className="font-sign text-4xl sm:text-5xl">{t('Who are you?', 'আপনি কে?')}</h1>
        <SpeakButton text={{ en: 'Who are you? Tap your picture.', bn: 'আপনি কে? আপনার ছবিতে চাপ দিন।' }} size="lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {ROLES.map((r) => (
          <div
            key={r.role}
            className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 rounded-3xl border-2 border-line bg-white p-4 transition hover:border-guide-600 md:flex md:flex-col md:p-6 md:text-center"
          >
            <RoleArt role={r.role} />
            <div className="min-w-0 md:mt-4 md:flex-1">
              <h2 className="font-sign text-3xl leading-tight">{tx(r.title)}</h2>
              <p className="mt-1 text-ink-soft">{tx(r.desc)}</p>
            </div>
            <SpeakButton text={{ en: `${r.title.en}. ${r.desc.en}`, bn: `${r.title.bn}। ${r.desc.bn}` }} className="relative z-10 self-start md:absolute md:right-4 md:top-4" />
            <button
              type="button"
              onClick={() => {
                hint(r.title);
                if (r.role === 'worker') setStep('face');
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