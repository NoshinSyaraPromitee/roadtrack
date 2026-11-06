import { Mic, Volume2, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { speak } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import { ApaAvatar } from '../ApaAvatar';
import type { Tip } from '../brain';

const TIP_TEXT = {
  info: 'text-ink',
  warn: 'text-ink',
  alert: 'text-stop-700',
};

export function ApaTip({ tip, openPanel, askByVoice, setHiddenTip }: { tip: Tip; openPanel: () => void; askByVoice: () => void; setHiddenTip: (key: string) => void }) {
  const i = useI18n();
  const tipBody = (
    <>
      <p className={cn('font-semibold leading-snug', TIP_TEXT[tip.tone])}>{i.tx(tip.text)}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1">
        <button type="button" onClick={() => speak(tip.text, i.lang)} className="flex h-10 items-center gap-1.5 px-1.5 rounded-lg font-semibold text-guide-700 hover:bg-guide-50">
          <Volume2 className="h-5 w-5" />
          {i.t('Listen', 'শুনুন')}
        </button>
        <button type="button" onClick={askByVoice} className="flex h-10 items-center gap-1.5 px-1.5 rounded-lg font-semibold text-guide-700 hover:bg-guide-50">
          <Mic className="h-5 w-5" />
          {i.t('Ask by voice', 'কণ্ঠে বলুন')}
        </button>
        <button
          type="button"
          onClick={() => setHiddenTip(tip.key)}
          aria-label={i.t('Hide this tip', 'এই পরামর্শ লুকান')}
          className="ml-auto grid h-10 w-10 place-items-center text-ink-soft hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );

  return (
    <div role="status" className="mb-5 flex items-start gap-2 sm:gap-3">
      <button type="button" onClick={openPanel} aria-label={i.t('Ask Apa', 'আপাকে বলুন')} className="shrink-0">
        <ApaAvatar size={52} />
      </button>
      <div className="relative min-w-0 flex-1 rounded-2xl bg-white p-3 ring-1 ring-line sm:max-w-2xl">
        <span className="absolute -left-[7px] top-5 h-3.5 w-3.5 rotate-45 bg-white ring-1 ring-line [clip-path:polygon(0_0,0_100%,100%_100%)]" aria-hidden="true" />
        {tipBody}
      </div>
    </div>
  );
}
