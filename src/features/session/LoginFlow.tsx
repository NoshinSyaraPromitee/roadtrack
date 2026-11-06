import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, ClipboardCheck, HardHat } from 'lucide-react';
import type { Role } from '@/core/types';
import { RoadSelect, useRoad } from '@/features/road';
import { PeoplePicker, shortName, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { ActionBar, Pictogram, RoadStrip } from '@/shared/ui';
import type { IconType, PictoShape, PictoTone } from '@/shared/ui';
import { SignInForm } from './SignInForm';
import { useSession } from './store';

const ROLES: Array<{ role: Role; path: string; title: Text; cta: Text; icon: IconType; tone: PictoTone; shape: PictoShape }> = [
  { role: 'worker', path: '/worker', title: { en: 'Worker', bn: 'শ্রমিক' }, cta: { en: 'I am a worker', bn: 'আমি শ্রমিক' }, icon: HardHat, tone: 'mark', shape: 'plate' },
  { role: 'supervisor', path: '/supervisor', title: { en: 'Supervisor', bn: 'সুপারভাইজার' }, cta: { en: 'I am the supervisor', bn: 'আমি সুপারভাইজার' }, icon: ClipboardCheck, tone: 'guide', shape: 'plate' },
  { role: 'admin', path: '/admin', title: { en: 'Head office', bn: 'প্রধান কার্যালয়' }, cta: { en: 'Open the office view', bn: 'অফিসের পাতা খুলুন' }, icon: Building2, tone: 'sign', shape: 'disc' },
];

export type LoginStep = 'role' | 'name' | 'signin';

/** Pick the road from the dropdown and who you are; workers then tap their name. */
export function LoginFlow({ progress, onStepChange }: { progress: Record<string, number>; onStepChange?: (step: LoginStep) => void }) {
  const { t, tx } = useI18n();
  const { hint, say } = useSay();
  const login = useSession((s) => s.login);
  const session = useSession();
  const [signinRole, setSigninRole] = useState<(typeof ROLES)[number] | null>(null);
  const workers = useWorkforce((s) => s.workers);
  const navigate = useNavigate();
  const road = useRoad();
  const [step, setStepState] = useState<LoginStep>('role');
  const [picked, setPicked] = useState<string | null>(null);
  const me = workers.find((w) => w.id === picked);

  const setStep = (next: LoginStep) => {
    setStepState(next);
    onStepChange?.(next);
    window.scrollTo({ top: 0 });
  };

  const enter = (role: Role, path: string, ids: { workerId?: string | null; accountId?: string | null } = {}) => {
    login(role, ids);
    navigate(path);
  };

  if (step === 'signin' && signinRole && signinRole.role !== 'worker') {
    const r = signinRole;
    const role = r.role as 'supervisor' | 'admin';
    return (
      <SignInForm
        role={role}
        title={role === 'admin' ? { en: 'Head office sign in', bn: 'প্রধান কার্যালয় সাইন ইন' } : { en: 'Supervisor sign in', bn: 'সুপারভাইজার সাইন ইন' }}
        onBack={() => setStep('role')}
        onDone={(account) => enter(role, r.path, { accountId: account.id })}
      />
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
        <div className="mb-5" />
        <PeoplePicker people={workers} selected={picked ? [picked] : []} onPick={setPicked} size={80} />
        <ActionBar
          onBack={() => {
            setPicked(null);
            setStep('role');
          }}
          onNext={() => {
            if (me) enter('worker', '/worker', { workerId: me.id });
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
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="font-sign text-3xl sm:text-5xl">{t('Which road?', 'কোন রাস্তা?')}</h1>
          <SpeakButton text={{ en: 'Which road are you working on? Tap the box to choose.', bn: 'আপনি কোন রাস্তায় কাজ করছেন? বাছাই করতে বাক্সে চাপ দিন।' }} size="lg" />
        </div>
        <RoadSelect progress={progress} />
        <div className="mt-3 rounded-2xl border border-line bg-white p-3 sm:p-4">
          <RoadStrip progress={progress[road.id] ?? 0} lengthKm={road.lengthKm} size="lg" />
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
            </div>
            <SpeakButton text={r.title} className="relative z-10 md:absolute md:right-4 md:top-4" />
            <button
              type="button"
              onClick={() => {
                hint(r.title);
                if (r.role === 'worker') setStep('name');
                // Already signed in as this role on this phone: go straight in.
                else if (session.role === r.role && session.accountId) navigate(r.path);
                else {
                  setSigninRole(r);
                  setStep('signin');
                }
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
