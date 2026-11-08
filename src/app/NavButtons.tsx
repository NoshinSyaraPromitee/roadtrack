import { useNavigate } from 'react-router-dom';
import { ArrowLeft, House } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';

const PILL = 'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-line bg-white font-semibold text-ink transition hover:border-guide-600 hover:bg-guide-50';

/** Back and home, shown above every dashboard. On phones the home button shows only its icon. */
export function NavButtons() {
  const i = useI18n();
  const { hint } = useSay();
  const navigate = useNavigate();
  const homeLabel = i.t('Return to home', 'হোমে ফিরে যান');

  const back = () => {
    hint({ en: 'Going back', bn: 'ফিরে যাচ্ছি' });
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
    window.scrollTo({ top: 0 });
  };
  const home = () => {
    hint({ en: 'Going home', bn: 'হোমে যাচ্ছি' });
    navigate('/');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={back} className={`${PILL} pl-2.5 pr-4`}>
        <ArrowLeft className="h-5 w-5" />
        {i.t('Back', 'ফিরে যান')}
      </button>
      <button type="button" onClick={home} aria-label={homeLabel} title={homeLabel} className={`${PILL} w-11 sm:w-auto sm:pl-3 sm:pr-4`}>
        <House className="h-5 w-5" />
        <span className="hidden sm:inline">{homeLabel}</span>
      </button>
    </div>
  );
}
