import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Account } from '@/core/accounts';
import type { Provider } from '@/core/registrations';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Button } from '@/shared/ui';
import { ContractorRegisterForm } from './ContractorRegisterForm';
import { SignInForm } from './SignInForm';
import { SocialSignIn } from './SocialSignIn';

type Mode = { kind: 'signin' } | { kind: 'register'; provider: Provider; email: string };

export function StaffSignIn({
  role,
  title,
  contractor = false,
  onDone,
  onBack,
}: {
  role: Account['role'];
  title: Text;
  contractor?: boolean;
  onDone: (account: Account) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>({ kind: 'signin' });
  const toSignIn = () => {
    setMode({ kind: 'signin' });
    window.scrollTo({ top: 0 });
  };

  if (mode.kind === 'register') return <ContractorRegisterForm key={mode.email} provider={mode.provider} startEmail={mode.email} onBack={toSignIn} />;

  return (
    <div className="space-y-4">
      <SignInForm role={role} title={title} onDone={onDone} onBack={onBack} />
      <div className="mx-auto max-w-md space-y-4">
        <SocialSignIn role={role} onAccount={onDone} onRegister={contractor ? (email, provider) => setMode({ kind: 'register', provider, email }) : undefined} />
        {contractor && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">{t('New contractor?', 'নতুন ঠিকাদার?')}</p>
            <Button variant="secondary" onClick={() => setMode({ kind: 'register', provider: 'phone', email: '' })}>
              <UserPlus />
              {t('Register', 'নিবন্ধন')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
