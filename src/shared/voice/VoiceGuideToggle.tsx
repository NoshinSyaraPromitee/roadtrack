import { Volume2, VolumeX } from 'lucide-react';
import { useLang } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { stopSpeaking } from './speech';
import { useVoiceGuide } from './store';

export function VoiceGuideToggle() {
  const on = useVoiceGuide((s) => s.on);
  const toggle = useVoiceGuide((s) => s.toggle);
  const lang = useLang((s) => s.lang);
  const label = lang === 'bn' ? (on ? 'কণ্ঠ সহায়তা চালু' : 'কণ্ঠ সহায়তা বন্ধ') : on ? 'Voice help is on' : 'Voice help is off';

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => {
        if (on) stopSpeaking();
        toggle();
      }}
      className={cn('grid h-10 w-10 place-items-center rounded-full transition', on ? 'bg-white text-guide-700' : 'bg-white/10 text-white/70 hover:bg-white/20')}
    >
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}