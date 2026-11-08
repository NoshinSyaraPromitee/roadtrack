import { useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';

export function HomeButton({ className }: { className?: string }) {
  const i = useI18n();
  const { hint } = useSay();
  const navigate = useNavigate();
  const label = i.t('Return to home', 'হোমে ফিরে যান');

  return (
    <button
      type="button"
      onClick={() => {
        hint({ en: 'Going home', bn: 'হোমে যাচ্ছি' });
        navigate('/');
        window.scrollTo({ top: 0 });
      }}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-line bg-white font-semibold text-ink transition hover:border-guide-600 hover:bg-guide-50 sm:w-auto sm:pl-3 sm:pr-4',
        className,
      )}
    >
      <House className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
