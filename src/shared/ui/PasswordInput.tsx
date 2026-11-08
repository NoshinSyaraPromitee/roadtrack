import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { Input } from './Field';

export function PasswordInput({ shown, onToggle, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { shown?: boolean; onToggle?: () => void }) {
  const { t } = useI18n();
  const [own, setOwn] = useState(false);
  const show = shown ?? own;
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        onClick={onToggle ?? (() => setOwn((v) => !v))}
        aria-label={show ? t('Hide password', 'পাসওয়ার্ড লুকান') : t('Show password', 'পাসওয়ার্ড দেখুন')}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-ink-soft hover:text-ink"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
