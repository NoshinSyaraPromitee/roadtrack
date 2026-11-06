import { useI18n } from '@/shared/i18n';
import { ApaAvatar } from '../ApaAvatar';

export function ApaLauncher({ openPanel }: { openPanel: () => void }) {
  const i = useI18n();
  return (
    <button
      type="button"
      onClick={openPanel}
      aria-label={i.t('Ask Apa, your helper', 'আপাকে জিজ্ঞেস করুন, আপনার সহকারী')}
      className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-3 z-40 flex items-center gap-2 rounded-full bg-white p-1 ring-2 ring-line transition hover:bg-guide-50 hover:ring-guide-600 sm:right-5 sm:p-1.5 sm:pr-4"
    >
      <ApaAvatar size={52} />
      <span className="hidden text-left leading-tight sm:block">
        <span className="block font-sign text-lg">{i.t('Ask Apa', 'আপাকে বলুন')}</span>
        <span className="block text-xs text-ink-soft">{i.t('Your helper', 'আপনার সহকারী')}</span>
      </span>
    </button>
  );
}
