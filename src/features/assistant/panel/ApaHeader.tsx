import { Trash2, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { VoiceGuideToggle } from '@/shared/voice';
import { ApaAvatar } from '../ApaAvatar';
import type { ApaMood } from '../ApaAvatar';

export function ApaHeader({
  mood,
  status,
  close,
  hasMessages,
  confirmClear,
  setConfirmClear,
  onMuted,
}: {
  mood: ApaMood;
  status: string;
  close: () => void;
  hasMessages: boolean;
  confirmClear: boolean;
  setConfirmClear: (v: boolean) => void;
  onMuted: () => void;
}) {
  const i = useI18n();
  return (
    <header className="flex items-center gap-4 bg-guide-600 px-4 pb-4 pt-5 text-white">
      <ApaAvatar mood={mood} size={80} />
      <div className="min-w-0 flex-1">
        <h2 className="font-sign text-3xl leading-none">{i.t('Apa', 'আপা')}</h2>
        <p aria-live="polite" className="mt-1 text-white/85">
          {status}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2 self-start">
        <button type="button" onClick={close} aria-label={i.t('Close', 'বন্ধ করুন')} className="grid h-11 w-11 place-items-center rounded-full bg-white/12 transition hover:bg-white/25">
          <X className="h-6 w-6" />
        </button>
        <VoiceGuideToggle onChange={(on) => !on && onMuted()} />
        {hasMessages && !confirmClear && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            aria-label={i.t('Delete the chat', 'কথা মুছুন')}
            title={i.t('Delete the chat', 'কথা মুছুন')}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/12 transition hover:bg-white/25"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
