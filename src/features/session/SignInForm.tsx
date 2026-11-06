import { useState } from 'react';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import type { Account } from '@/core/accounts';
import { checkSignIn } from '@/core/accounts';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Button, Card, Field, Input } from '@/shared/ui';
import { useNow } from '@/shared/lib/useNow';
import type { Problem } from './signInProblems';
import { CHECK_FAILED, LOCK_MS, MAX_TRIES, inputProblem, lockedProblem, wrongProblem } from './signInProblems';

export function SignInForm({ role, title, onDone, onBack }: { role: Account['role']; title: Text; onDone: (account: Account) => void; onBack: () => void }) {
  const i = useI18n();
  const { t } = i;
  const now = useNow(1000);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const locked = lockedUntil > now;
  const wait = Math.ceil((lockedUntil - now) / 1000);

  const submit = async () => {
    if (busy || locked) return;
    const used = lockedUntil ? 0 : tries;
    if (lockedUntil) setLockedUntil(0);
    const bad = inputProblem(phone, password, i);
    if (bad) {
      setProblem(bad);
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const result = await checkSignIn(role, phone, password);
      if (result.ok) {
        onDone(result.account);
        return;
      }
      const next = used + 1;
      setTries(next);
      if (next >= MAX_TRIES) {
        setLockedUntil(Date.now() + LOCK_MS);
        setProblem(lockedProblem(i));
      } else {
        setProblem(wrongProblem(MAX_TRIES - next, i));
      }
    } catch {
      setProblem(CHECK_FAILED);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="font-sign text-3xl sm:text-4xl">{i.tx(title)}</h1>
        <SpeakButton text={{ en: `${title.en}. Write your phone number and password.`, bn: `${title.bn}। আপনার ফোন নম্বর আর পাসওয়ার্ড লিখুন।` }} size="lg" />
      </div>
      <Card>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label={t('Phone number', 'ফোন নম্বর')}>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!locked) setProblem(null);
              }}
              inputMode="tel"
              autoComplete="username"
              placeholder="01XXXXXXXXX"
              disabled={busy || locked}
            />
          </Field>
          <Field label={t('Password', 'পাসওয়ার্ড')}>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!locked) setProblem(null);
                }}
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={busy || locked}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? t('Hide password', 'পাসওয়ার্ড লুকান') : t('Show password', 'পাসওয়ার্ড দেখুন')}
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-ink-soft hover:text-ink"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </Field>

          {problem && (
            <div role="alert" className="rounded-xl bg-stop-50 p-3 text-[0.95rem] leading-snug">
              <p className="font-semibold text-stop-700">{i.tx(problem.why)}</p>
              <p className="mt-1 text-ink">{i.tx(problem.fix)}</p>
              {locked && <p className="mt-1 font-semibold text-stop-700">{t(`Try again in ${wait} seconds.`, `${i.num(wait)} সেকেন্ড পরে আবার চেষ্টা করুন।`)}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="secondary" size="lg" onClick={onBack} disabled={busy}>
              {t('Back', 'পেছনে')}
            </Button>
            <Button type="submit" size="lg" disabled={busy || locked} className="ml-auto min-w-0 flex-1">
              {busy ? <Loader2 className="animate-spin" /> : <LogIn />}
              {busy ? t('Checking…', 'যাচাই হচ্ছে…') : t('Sign in', 'সাইন ইন')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
