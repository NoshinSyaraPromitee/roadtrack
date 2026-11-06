import { useState } from 'react';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import type { Account } from '@/core/accounts';
import { canHash, checkSignIn, normalizePhone } from '@/core/accounts';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Button, Card, Field, Input } from '@/shared/ui';
import { useNow } from '@/shared/lib/useNow';

const MAX_TRIES = 5;
const LOCK_MS = 30_000;

type Problem = { why: Text; fix: Text };

/** The supervisor and the head office sign in with their phone number and password. */
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
    // After a lock runs out, the person gets a fresh set of tries.
    const used = lockedUntil ? 0 : tries;
    if (lockedUntil) setLockedUntil(0);
    const digits = normalizePhone(phone);
    if (!digits) {
      setProblem({ why: { en: 'The phone number is empty.', bn: 'ফোন নম্বর লেখা হয়নি।' }, fix: { en: 'Write the phone number the office gave you.', bn: 'অফিস যে ফোন নম্বর দিয়েছে তা লিখুন।' } });
      return;
    }
    if (digits.length !== 11 || !digits.startsWith('01')) {
      setProblem({
        why: { en: `A Bangladeshi mobile number has 11 digits and starts with 01. This one has ${digits.length}.`, bn: `বাংলাদেশের মোবাইল নম্বর ১১ অঙ্কের, শুরু হয় ০১ দিয়ে। এখানে ${i.num(digits.length)}টি অঙ্ক আছে।` },
        fix: { en: 'Check the number and write all 11 digits.', bn: 'নম্বরটি আবার দেখে ১১টি অঙ্কই লিখুন।' },
      });
      return;
    }
    if (!password) {
      setProblem({ why: { en: 'The password is empty.', bn: 'পাসওয়ার্ড লেখা হয়নি।' }, fix: { en: 'Write your password.', bn: 'আপনার পাসওয়ার্ড লিখুন।' } });
      return;
    }
    if (!canHash()) {
      setProblem({
        why: { en: 'This page was opened without https, so the browser turns off the safe password check.', bn: 'পাতাটি https ছাড়া খোলা হয়েছে, তাই ব্রাউজার নিরাপদ পাসওয়ার্ড যাচাই বন্ধ রেখেছে।' },
        fix: { en: 'Open the site with an https:// address, or on this computer at localhost.', bn: 'সাইটটি https:// ঠিকানা দিয়ে খুলুন, অথবা এই কম্পিউটারে localhost দিয়ে খুলুন।' },
      });
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
        setProblem({
          why: { en: `The phone number or password was wrong ${MAX_TRIES} times.`, bn: `ফোন নম্বর বা পাসওয়ার্ড ${i.num(MAX_TRIES)} বার ভুল হয়েছে।` },
          fix: { en: 'Wait 30 seconds and try again. If you forgot the password, call the head office.', bn: '৩০ সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন। পাসওয়ার্ড ভুলে গেলে প্রধান কার্যালয়ে ফোন করুন।' },
        });
      } else {
        setProblem({
          why: { en: 'The phone number or the password does not match.', bn: 'ফোন নম্বর বা পাসওয়ার্ড মেলেনি।' },
          fix: {
            en: `Check both and try again. Capital and small letters count in the password. ${MAX_TRIES - next} tries left.`,
            bn: `দুটোই আবার দেখে লিখুন। পাসওয়ার্ডে বড় আর ছোট হাতের অক্ষর আলাদা ধরা হয়। আর ${i.num(MAX_TRIES - next)} বার চেষ্টা করতে পারবেন।`,
          },
        });
      }
    } catch {
      setProblem({
        why: { en: 'The browser could not check the password.', bn: 'ব্রাউজার পাসওয়ার্ড যাচাই করতে পারেনি।' },
        fix: { en: 'Reload the page and try again. If it keeps happening, use Google Chrome or Microsoft Edge.', bn: 'পাতা রিলোড করে আবার চেষ্টা করুন। বারবার হলে Google Chrome বা Microsoft Edge ব্যবহার করুন।' },
      });
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
