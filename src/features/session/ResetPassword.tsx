import { useState } from 'react';
import { CircleCheck, KeyRound, MessageSquareText, Send } from 'lucide-react';
import type { Account } from '@/core/accounts';
import { findAccount, hashPassword, isMobileNumber, maskPhone, normalizePhone, passwordProblems } from '@/core/accounts';
import { useI18n } from '@/shared/i18n';
import { Button, Card, CardHeader, confirmSent, DemoToast, Field, Input } from '@/shared/ui';
import { RESET_CODE_MS, RESET_TRIES, newResetCode, usePasswords } from './passwordStore';
import { NewPasswordFields } from './NewPasswordFields';

type Step = 'phone' | 'code' | 'new';

export function ResetPassword({
  role,
  startPhone,
  extra = [],
  onDone,
  onBack,
}: {
  role: Account['role'];
  startPhone: string;
  extra?: Account[];
  onDone: (phone: string) => void;
  onBack: () => void;
}) {
  const i = useI18n();
  const { t } = i;
  const setHash = usePasswords((s) => s.setHash);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(startPhone);
  const [code, setCode] = useState<{ value: string; until: number } | null>(null);
  const [typed, setTyped] = useState('');
  const [tries, setTries] = useState(0);
  const [error, setError] = useState('');
  const account = findAccount(role, phone, extra);
  const digits = normalizePhone(phone);

  const send = () => {
    if (!isMobileNumber(digits)) return setError(t('Write all 11 digits of your phone number, starting with 01.', 'ফোন নম্বরের ১১টি অঙ্কই লিখুন, ০১ দিয়ে শুরু।'));
    setCode({ value: newResetCode(), until: Date.now() + RESET_CODE_MS });
    setTyped('');
    setTries(0);
    setError('');
    setStep('code');
  };

  const check = () => {
    if (!code || Date.now() > code.until) return setError(t('The code has expired. Tap "Send a new code".', 'কোডের সময় শেষ। "নতুন কোড পাঠান" চাপুন।'));
    if (!account || typed.trim() !== code.value) {
      const left = RESET_TRIES - tries - 1;
      setTries(tries + 1);
      if (left <= 0) {
        setCode(null);
        return setError(t('Wrong code 3 times. Tap "Send a new code" to get another.', '৩ বার ভুল কোড। আরেকটি পেতে "নতুন কোড পাঠান" চাপুন।'));
      }
      return setError(t(`That code is not right. ${left} tries left.`, `কোডটি ঠিক নয়। আর ${i.num(left)} বার চেষ্টা করতে পারবেন।`));
    }
    setError('');
    setStep('new');
  };

  const save = async (password: string, again: string) => {
    if (!account || passwordProblems(password, again).length) return;
    setHash(account.id, await hashPassword(account.id, password));
    confirmSent({ en: 'Password changed', bn: 'পাসওয়ার্ড বদলানো হয়েছে' }, { en: 'Sign in with the new password.', bn: 'নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।' });
    onDone(phone);
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader
          icon={KeyRound}
          title={t('Reset your password', 'পাসওয়ার্ড বদলান')}
          subtitle={step === 'phone' ? t('We send a 6-digit code to your phone.', 'আপনার ফোনে ৬ অঙ্কের একটি কোড পাঠানো হবে।') : step === 'new' ? t('Choose a new password.', 'নতুন পাসওয়ার্ড দিন।') : undefined}
        />
        {step === 'phone' && (
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Field label={t('Phone number', 'ফোন নম্বর')}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="username" placeholder="01XXXXXXXXX" />
            </Field>
            {error && <p role="alert" className="font-semibold text-stop-600">{error}</p>}
            <Button type="submit" size="lg" className="w-full">
              <Send />
              {t('Send code', 'কোড পাঠান')}
            </Button>
          </form>
        )}
        {step === 'code' && (
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <p className="text-ink-soft">{t(`If ${maskPhone(digits)} belongs to an account, a code was sent to it. It works for 5 minutes.`, `${maskPhone(digits)} নম্বরে অ্যাকাউন্ট থাকলে সেখানে কোড পাঠানো হয়েছে। কোডটি ৫ মিনিট চলবে।`)}</p>
            {account && code && (
              <DemoToast key={code.value} icon={MessageSquareText}>
                {t('Demo only: there is no SMS service, so the message is shown here.', 'শুধু ডেমো: এসএমএস সেবা নেই, তাই বার্তাটি এখানে দেখানো হলো।')}
                <span className="mt-1 block font-sign text-3xl tracking-[0.2em] text-sign-600">{code.value}</span>
              </DemoToast>
            )}
            <Field label={t('6-digit code', '৬ অঙ্কের কোড')}>
              <Input value={typed} onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" className="font-sign text-2xl tracking-[0.3em]" />
            </Field>
            {error && <p role="alert" className="font-semibold text-stop-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="lg" disabled={!code || typed.length !== 6} className="min-w-0 flex-1">
                <CircleCheck />
                {t('Check code', 'কোড মিলিয়ে দেখুন')}
              </Button>
              <Button variant="secondary" size="lg" onClick={send}>
                {t('Send a new code', 'নতুন কোড পাঠান')}
              </Button>
            </div>
          </form>
        )}
        {step === 'new' && <NewPasswordFields onSave={save} />}
        <Button variant="ghost" className="mt-4" onClick={onBack}>
          {t('Back to sign in', 'সাইন ইনে ফিরে যান')}
        </Button>
      </Card>
    </div>
  );
}
