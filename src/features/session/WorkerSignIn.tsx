import { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { PeoplePicker, shortName, useWorkforce, WorkerSignUp } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { SpeakButton, useSay } from '@/shared/voice';
import { ActionBar, Button, confirmSent } from '@/shared/ui';

const HEADING = 'font-sign text-[2.5rem] leading-none sm:text-[3.5rem]';

/** A worker signs in by tapping their own face, or signs up with name, age and work. */
export function WorkerSignIn({ onEnter, onBack }: { onEnter: (workerId: string) => void; onBack: () => void }) {
  const { t } = useI18n();
  const { say } = useSay();
  const workers = useWorkforce((s) => s.workers);
  const [picked, setPicked] = useState<string | null>(null);
  const [signingUp, setSigningUpState] = useState(false);
  const me = workers.find((w) => w.id === picked);
  const setSigningUp = (on: boolean) => {
    setSigningUpState(on);
    window.scrollTo({ top: 0 });
  };

  if (signingUp) {
    return (
      <div>
        <h1 className={`mb-5 ${HEADING}`}>{t('New worker', 'নতুন শ্রমিক')}</h1>
        <WorkerSignUp
          onBack={() => setSigningUp(false)}
          onDone={(w) => {
            confirmSent({ en: `Welcome, ${shortName(w, 'en')}`, bn: `স্বাগতম, ${shortName(w, 'bn')}` }, { en: 'You are now on the worker list.', bn: 'আপনি এখন শ্রমিকের তালিকায় আছেন।' });
            onEnter(w.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="mb-5 flex items-center gap-3">
        <h1 className={HEADING}>{t('Tap your name', 'আপনার নামে চাপ দিন')}</h1>
        <SpeakButton text={{ en: 'Tap your name. The phone will say the name you tapped.', bn: 'আপনার নামে চাপ দিন। চাপ দিলে ফোন নামটি বলে দেবে।' }} size="lg" />
      </div>
      <PeoplePicker people={workers} selected={picked ? [picked] : []} onPick={setPicked} size={80} />
      <Button variant="secondary" size="lg" className="mt-5" onClick={() => setSigningUp(true)}>
        <UserPlus />
        {t('New worker? Sign up', 'নতুন শ্রমিক? নাম লেখান')}
      </Button>
      <ActionBar
        onBack={onBack}
        onNext={() => {
          if (me) onEnter(me.id);
          else say({ en: 'Tap your name first', bn: 'আগে আপনার নামে চাপ দিন' });
        }}
        nextIcon={Check}
        nextLabel={me ? t(`Yes, I am ${shortName(me, 'en')}`, `হ্যাঁ, আমি ${shortName(me, 'bn')}`) : t('Tap your name', 'আপনার নামে চাপ দিন')}
      />
    </div>
  );
}
