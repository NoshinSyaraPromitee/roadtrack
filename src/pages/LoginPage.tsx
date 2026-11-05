import { useState } from 'react';
import { PROJECT } from '@/core/seed';
import { LoginFlow } from '@/features/session';
import type { LoginStep } from '@/features/session';
import { useProjectProgress } from '@/features/shift';
import { LangToggle, useI18n } from '@/shared/i18n';
import { Logo, RoadStrip } from '@/shared/ui';

export function LoginPage() {
  const i = useI18n();
  const progress = useProjectProgress();
  const [step, setStep] = useState<LoginStep>('role');

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <LangToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {step === 'role' && (
          <section className="relative mb-10 overflow-hidden rounded-3xl bg-guide-600 p-5 text-white sm:p-8">
            <div className="pointer-events-none absolute inset-2 rounded-[20px] border-2 border-white/85" />
            <div className="relative">
              <p className="font-sign text-4xl leading-[1.02] sm:text-6xl">{i.tx(PROJECT.name)}</p>
              <p className="mt-2 text-lg text-white/85">{i.tx(PROJECT.section)}</p>
              <div className="mt-6 rounded-2xl bg-white p-3 text-ink sm:p-4">
                <RoadStrip progress={progress} lengthKm={PROJECT.lengthKm} size="lg" />
              </div>
            </div>
          </section>
        )}
        <LoginFlow onStepChange={setStep} />
        {step === 'role' && (
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