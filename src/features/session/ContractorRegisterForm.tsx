import { useState } from 'react';
import type { ComponentProps } from 'react';
import { ArrowRight, CircleCheck, UserPlus } from 'lucide-react';
import { ACCOUNTS, hashPassword } from '@/core/accounts';
import type { Provider, RegistrationDraft, RegistrationProblem } from '@/core/registrations';
import { registrationProblems, takenContacts, toRegistration } from '@/core/registrations';
import { RoadBackdrop } from '@/features/road';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Button, Card, CardHeader, Field, Input } from '@/shared/ui';
import { uid } from '@/shared/lib/utils';
import { NewPasswordFields } from './NewPasswordFields';
import { useRegistrations } from './registrationStore';

const PROBLEM: Record<RegistrationProblem, Text> = {
  name: { en: 'Write your full name.', bn: 'আপনার পুরো নাম লিখুন।' },
  company: { en: 'Write the name of your firm.', bn: 'আপনার প্রতিষ্ঠানের নাম লিখুন।' },
  licence: { en: 'Use 4 to 20 letters, numbers, - or /.', bn: '৪ থেকে ২০টি অক্ষর, সংখ্যা, - বা / ব্যবহার করুন।' },
  phone: { en: 'Write all 11 digits, starting with 01.', bn: '০১ দিয়ে শুরু করে ১১টি অঙ্কই লিখুন।' },
  'phone-taken': { en: 'This number already has an account or a sign-up.', bn: 'এই নম্বরে আগেই অ্যাকাউন্ট বা নিবন্ধন আছে।' },
  email: { en: 'Write a full email address.', bn: 'পুরো ইমেইল ঠিকানা লিখুন।' },
  'email-taken': { en: 'This email already has an account or a sign-up.', bn: 'এই ইমেইলে আগেই অ্যাকাউন্ট বা নিবন্ধন আছে।' },
};

type Key = 'name' | 'company' | 'licence' | 'phone' | 'email';

export function ContractorRegisterForm({ provider, startEmail = '', onBack }: { provider: Provider; startEmail?: string; onBack: () => void }) {
  const i = useI18n();
  const { t } = i;
  const { list, add } = useRegistrations();
  const [draft, setDraft] = useState<RegistrationDraft>({ name: '', company: '', licence: '', phone: '', email: startEmail, provider });
  const [step, setStep] = useState<'details' | 'password' | 'sent'>('details');
  const [shown, setShown] = useState(false);
  const [id] = useState(() => uid('reg'));
  const problems = registrationProblems(draft, takenContacts(ACCOUNTS, list));
  const errorOf = (key: Key) => {
    const p = problems.find((x) => x === key || x === `${key}-taken`);
    return shown && p ? i.tx(PROBLEM[p]) : undefined;
  };

  const send = (passwordHash?: string) => {
    add(toRegistration(draft, id, new Date().toISOString(), passwordHash));
    setStep('sent');
  };

  const field = (key: Key, label: Text, extra: Partial<ComponentProps<typeof Input>> = {}, hint?: Text) => (
    <Field label={i.tx(label)} error={errorOf(key)} hint={hint && i.tx(hint)}>
      <Input value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} {...extra} />
    </Field>
  );

  if (step === 'sent') {
    return (
      <Card className="mx-auto max-w-md text-center">
        <RoadBackdrop />
        <CircleCheck className="mx-auto h-14 w-14 text-guide-600" />
        <h1 className="mt-3 font-sign text-3xl">{t('Sent to head office', 'প্রধান কার্যালয়ে পাঠানো হয়েছে')}</h1>
        <p className="mt-2 text-ink-soft">
          {t('Head office will check your trade licence. You can sign in after they approve it.', 'প্রধান কার্যালয় আপনার ট্রেড লাইসেন্স যাচাই করবে। অনুমোদনের পরে সাইন ইন করতে পারবেন।')}
        </p>
        <Button size="lg" className="mt-5 w-full" onClick={onBack}>
          {t('Back to sign in', 'সাইন ইনে ফিরে যান')}
        </Button>
      </Card>
    );
  }

  const social = provider !== 'phone';
  return (
    <div className="mx-auto max-w-md">
      <RoadBackdrop />
      <Card>
        <CardHeader
          icon={UserPlus}
          title={t('Register as a contractor', 'ঠিকাদার হিসেবে নিবন্ধন')}
          subtitle={step === 'password' ? t('Choose a password for your account.', 'আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন।') : t('Head office approves every new contractor.', 'প্রতিটি নতুন ঠিকাদার প্রধান কার্যালয় অনুমোদন করে।')}
        />
        {step === 'password' ? (
          <NewPasswordFields submitLabel={t('Send for approval', 'অনুমোদনের জন্য পাঠান')} onSave={async (password) => send(await hashPassword(id, password))} />
        ) : (
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setShown(true);
              if (problems.length) return;
              if (social) send();
              else setStep('password');
            }}
          >
            {field('name', { en: 'Full name', bn: 'পুরো নাম' }, { autoComplete: 'name' })}
            {field('company', { en: 'Firm name', bn: 'প্রতিষ্ঠানের নাম' }, { autoComplete: 'organization' })}
            {field('licence', { en: 'Trade licence number', bn: 'ট্রেড লাইসেন্স নম্বর' }, { placeholder: 'TRAD/DNCC/1234' })}
            {field('phone', { en: 'Phone number', bn: 'ফোন নম্বর' }, { inputMode: 'tel', autoComplete: 'tel', placeholder: '01XXXXXXXXX' })}
            {field('email', social ? { en: 'Email', bn: 'ইমেইল' } : { en: 'Email (optional)', bn: 'ইমেইল (ঐচ্ছিক)' }, { type: 'email', autoComplete: 'email', readOnly: social }, social ? { en: `Linked to your ${provider === 'google' ? 'Google' : 'Apple'} account.`, bn: `আপনার ${provider === 'google' ? 'Google' : 'Apple'} অ্যাকাউন্টের সাথে যুক্ত।` } : undefined)}
            <Button type="submit" size="lg" className="w-full">
              {social ? t('Send for approval', 'অনুমোদনের জন্য পাঠান') : t('Next: password', 'পরের ধাপ: পাসওয়ার্ড')}
              <ArrowRight />
            </Button>
          </form>
        )}
        <Button variant="ghost" className="mt-4" onClick={onBack}>
          {t('Back to sign in', 'সাইন ইনে ফিরে যান')}
        </Button>
      </Card>
    </div>
  );
}
