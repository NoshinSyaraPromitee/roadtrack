import { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import type { Account } from '@/core/accounts';
import { ACCOUNTS, findAccountByEmail, isEmail } from '@/core/accounts';
import type { Provider } from '@/core/registrations';
import { waitingRegistration } from '@/core/registrations';
import { useI18n } from '@/shared/i18n';
import { Button, DemoToast, Field, Input } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useApprovedAccounts, useRegistrations } from './registrationStore';

type Social = Exclude<Provider, 'phone'>;
const NAME: Record<Social, string> = { google: 'Google', apple: 'Apple' };

export function SocialSignIn({
  role,
  onAccount,
  onRegister,
}: {
  role: Account['role'];
  onAccount: (account: Account) => void;
  onRegister?: (email: string, provider: Social) => void;
}) {
  const { t } = useI18n();
  const extra = useApprovedAccounts();
  const registrations = useRegistrations((s) => s.list);
  const [provider, setProvider] = useState<Social | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const known = [...ACCOUNTS, ...extra].filter((a) => a.role === role && a.email).map((a) => a.email as string);

  const go = (value = email) => {
    if (!provider) return;
    if (!isEmail(value)) return setMessage(t('Write a full email address, like name@gmail.com.', 'পুরো ইমেইল ঠিকানা লিখুন, যেমন name@gmail.com।'));
    const account = findAccountByEmail(role, value, extra);
    if (account) return onAccount(account);
    const waiting = role === 'supervisor' ? waitingRegistration(registrations, { email: value }) : undefined;
    if (waiting?.status === 'pending') return setMessage(t('This registration is waiting for head office approval.', 'এই নিবন্ধন প্রধান কার্যালয়ের অনুমোদনের অপেক্ষায় আছে।'));
    if (waiting) return setMessage(t('Head office did not approve this registration. Register again or call the office.', 'প্রধান কার্যালয় এই নিবন্ধন অনুমোদন করেনি। আবার নিবন্ধন করুন বা অফিসে ফোন করুন।'));
    if (onRegister) return onRegister(value, provider);
    setMessage(t('No account uses this email.', 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই।'));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        {t('or', 'অথবা')}
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {(['google', 'apple'] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={provider === p}
            onClick={() => {
              setProvider(p);
              setMessage('');
            }}
            className={cn(
              'h-12 rounded-xl font-semibold transition',
              p === 'apple' ? 'bg-ink text-white hover:bg-black' : 'bg-white text-ink ring-1 ring-inset ring-line hover:ring-ink-soft',
              provider === p && 'ring-2 ring-sign-500 ring-offset-2',
            )}
          >
            {t(`Continue with ${NAME[p]}`, `${NAME[p]} দিয়ে চালিয়ে যান`)}
          </button>
        ))}
      </div>

      {provider && (
        <form
          noValidate
          className="space-y-3 rounded-2xl border border-line bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <DemoToast key={provider} icon={Info} side="left">
            {t(
              `Demo only: there is no real ${NAME[provider]} connection. Write the ${NAME[provider]} email you would use.`,
              `শুধু ডেমো: আসল ${NAME[provider]} সংযোগ নেই। যে ${NAME[provider]} ইমেইল ব্যবহার করতেন সেটি লিখুন।`,
            )}
          </DemoToast>
          <Field label={t(`${NAME[provider]} email`, `${NAME[provider]} ইমেইল`)}>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage('');
              }}
              type="email"
              autoComplete="email"
              placeholder="name@gmail.com"
            />
          </Field>
          {known.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {known.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setEmail(k);
                    go(k);
                  }}
                  className="rounded-full bg-guide-50 px-3 py-1.5 text-sm font-semibold text-guide-700 hover:bg-guide-100"
                >
                  {k}
                </button>
              ))}
            </div>
          )}
          {message && <p role="alert" className="font-semibold text-stop-600">{message}</p>}
          <Button type="submit" size="lg" className="w-full">
            {t('Continue', 'চালিয়ে যান')}
            <ArrowRight />
          </Button>
        </form>
      )}
    </div>
  );
}
