import { useState } from 'react';
import { LoginFlow } from '@/features/session';
import type { LoginStep } from '@/features/session';
import { useRoadProgressMap } from '@/features/shift';
import { LangToggle, useI18n } from '@/shared/i18n';
import { Logo } from '@/shared/ui';

export function LoginPage() {
  const i = useI18n();
  const progress = useRoadProgressMap();
  const [step, setStep] = useState<LoginStep>('road');

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <LangToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <LoginFlow progress={progress} onStepChange={setStep} />
        {step !== 'name' && (
          <p className="mt-8 text-ink-soft">
            {i.t(
              'This is a demo. Everything you enter stays in this browser. Use the reset button at the top of any page to start again.',
              'এটি একটি ডেমো। আপনার দেওয়া সব তথ্য এই ব্রাউজারেই থাকে। আবার শুরু করতে যেকোনো পাতার উপরের রিসেট বোতাম চাপুন।',
            )}
          </p>
        )}
      </main>
    </div>
  );
}
