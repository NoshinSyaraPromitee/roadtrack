import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';

/** Goes back one screen. On the first screen after choosing who you are, it goes back to that choice. */
export function BackButton({ className }: { className?: string }) {
  const i = useI18n();
  const { hint } = useSay();
  const navigate = useNavigate();

  const back = () => {
    hint({ en: 'Going back', bn: 'ফিরে যাচ্ছি' });
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
    window.scrollTo({ top: 0 });
  };

  return (
    <button
      type="button"
      onClick={back}
      className={cn('inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-2 border-line bg-white pl-2.5 pr-4 font-semibold text-ink transition hover:border-ink-soft/40 active:scale-[0.98]', className)}
    >
      <ArrowLeft className="h-5 w-5" />
      {i.t('Back', 'ফিরে যান')}
    </button>
  );
}
