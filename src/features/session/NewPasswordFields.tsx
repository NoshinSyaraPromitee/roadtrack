import { useState } from 'react';
import { Check, Loader2, Save, X } from 'lucide-react';
import { PASSWORD_MIN, passwordProblems } from '@/core/accounts';
import type { PasswordProblem } from '@/core/accounts';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Button, Field, Input, PasswordInput } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

const RULES: Array<{ key: PasswordProblem; text: Text }> = [
  { key: 'short', text: { en: `At least ${PASSWORD_MIN} characters`, bn: 'অন্তত ৮টি অক্ষর' } },
  { key: 'letter', text: { en: 'At least one letter', bn: 'অন্তত একটি অক্ষর (a-z)' } },
  { key: 'number', text: { en: 'At least one number', bn: 'অন্তত একটি সংখ্যা (0-9)' } },
  { key: 'mismatch', text: { en: 'Both boxes match', bn: 'দুটো ঘর একই' } },
];

export function NewPasswordFields({ onSave }: { onSave: (password: string, again: string) => Promise<void> }) {
  const { t, tx } = useI18n();
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const problems = passwordProblems(password, again);
  const ready = problems.length === 0;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ready || busy) return;
        setBusy(true);
        await onSave(password, again);
        setBusy(false);
      }}
    >
      <Field label={t('New password', 'নতুন পাসওয়ার্ড')}>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" shown={show} onToggle={() => setShow((v) => !v)} />
      </Field>
      <Field label={t('Write it again', 'আবার লিখুন')}>
        <Input value={again} onChange={(e) => setAgain(e.target.value)} type={show ? 'text' : 'password'} autoComplete="new-password" />
      </Field>
      <ul className="icon-inherit space-y-1 text-[0.95rem]">
        {RULES.map((r) => {
          const ok = !problems.includes(r.key) && (r.key !== 'mismatch' || again.length > 0);
          return (
            <li key={r.key} className={cn('flex items-center gap-2', ok ? 'text-guide-700' : 'text-ink-soft')}>
              {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {tx(r.text)}
            </li>
          );
        })}
      </ul>
      <Button type="submit" size="lg" className="w-full" disabled={!ready || busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Save />}
        {t('Save new password', 'নতুন পাসওয়ার্ড সেভ করুন')}
      </Button>
    </form>
  );
}
