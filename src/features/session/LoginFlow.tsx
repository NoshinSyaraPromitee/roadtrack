import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ClipboardCheck, HardHat } from 'lucide-react';
import type { Role } from '@/core/types';
import { RoadHero, RoadSelect, useRoad } from '@/features/road';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { Pictogram } from '@/shared/ui';
import type { IconType, PictoShape, PictoTone } from '@/shared/ui';
import { StaffSignIn } from './StaffSignIn';
import { WorkerSignIn } from './WorkerSignIn';
import { useSession } from './store';

const ROLES: Array<{ role: Role; path: string; title: Text; cta: Text; icon: IconType; tone: PictoTone; shape: PictoShape }> = [
  { role: 'worker', path: '/worker', title: { en: 'Worker', bn: 'শ্রমিক' }, cta: { en: 'I am a worker', bn: 'আমি শ্রমিক' }, icon: HardHat, tone: 'mark', shape: 'plate' },
  { role: 'supervisor', path: '/supervisor', title: { en: 'Supervisor', bn: 'সুপারভাইজার' }, cta: { en: 'I am the supervisor', bn: 'আমি সুপারভাইজার' }, icon: ClipboardCheck, tone: 'guide', shape: 'plate' },
  { role: 'admin', path: '/admin', title: { en: 'Head office', bn: 'প্রধান কার্যালয়' }, cta: { en: 'Open the office view', bn: 'অফিসের পাতা খুলুন' }, icon: Building2, tone: 'sign', shape: 'disc' },
];

type LoginStep = 'role' | 'name' | 'signin';

export function LoginFlow({ progress }: { progress: Record<string, number> }) {
  const { t, tx } = useI18n();
  const { hint } = useSay();
  const login = useSession((s) => s.login);
  const session = useSession();
  const [signinRole, setSigninRole] = useState<(typeof ROLES)[number] | null>(null);
  const navigate = useNavigate();
  const road = useRoad();
  const [step, setStepState] = useState<LoginStep>('role');

  const setStep = (next: LoginStep) => {
    setStepState(next);
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
      <StaffSignIn
        role={role}
        title={{ en: `${r.title.en} sign in`, bn: `${r.title.bn} সাইন ইন` }}
        onBack={() => setStep('role')}
        onDone={(account) => enter(role, r.path, { accountId: account.id })}
      />
    );
  }

  if (step === 'name') return <WorkerSignIn onBack={() => setStep('role')} onEnter={(workerId) => enter('worker', '/worker', { workerId })} />;

  return (
    <div>
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="font-sign text-[2.5rem] leading-none sm:text-[3.5rem]">{t('Which road?', 'কোন রাস্তা?')}</h1>
          <SpeakButton text={{ en: 'Which road are you working on? Tap the box to choose.', bn: 'আপনি কোন রাস্তায় কাজ করছেন? বাছাই করতে বাক্সে চাপ দিন।' }} size="lg" />
        </div>
        <RoadSelect progress={progress} />
        <RoadHero road={road} progress={progress[road.id] ?? 0} className="mt-3" />
      </section>
      <div className="mb-5 flex items-center gap-3">
        <h1 className="font-sign text-[2.5rem] leading-none sm:text-[3.5rem]">{t('Who are you?', 'আপনি কে?')}</h1>
        <SpeakButton text={{ en: 'Who are you? Choose one.', bn: 'আপনি কে? একটি বেছে নিন।' }} size="lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {ROLES.map((r) => (
          <div
            key={r.role}
            className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 rounded-[18px] border border-line bg-white p-4 transition hover:border-guide-600 hover:bg-guide-50 md:flex md:flex-col md:p-6 md:text-center"
          >
            <span className="md:hidden">
              <Pictogram icon={r.icon} tone={r.tone} shape={r.shape} size={64} keepTone fullSize />
            </span>
            <span className="hidden md:block">
              <Pictogram icon={r.icon} tone={r.tone} shape={r.shape} size={88} keepTone fullSize />
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
                else if (session.role === r.role && session.accountId) navigate(r.path);
                else {
                  setSigninRole(r);
                  setStep('signin');
                }
              }}
              className="col-span-3 mt-4 h-14 w-full rounded-2xl bg-guide-600 text-lg font-semibold text-white transition after:absolute after:inset-0 after:rounded-3xl hover:bg-guide-700 md:mt-5"
            >
              {tx(r.cta)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
