import { Volume2, VolumeX } from 'lucide-react';
import { useLang } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { stopSpeaking } from './speech';
import { useVoiceGuide } from './store';

export function VoiceGuideToggle({ tone = 'dark', withLabel = false, onChange }: { tone?: 'dark' | 'light'; withLabel?: boolean; onChange?: (on: boolean) => void }) {
  const on = useVoiceGuide((s) => s.on);
  const toggle = useVoiceGuide((s) => s.toggle);
  const bn = useLang((s) => s.lang) === 'bn';
  const state = bn ? (on ? 'শব্দ চালু' : 'শব্দ বন্ধ') : on ? 'Sound on' : 'Muted';
  const action = bn ? (on ? 'শব্দ বন্ধ করুন' : 'শব্দ চালু করুন') : on ? 'Mute the voice' : 'Turn the voice on';
  const dark = tone === 'dark';

  return (
    <button
      type="button"
      aria-pressed={!on}
      aria-label={action}
      title={action}
      onClick={() => {
        if (on) stopSpeaking();
        toggle();
        onChange?.(!on);
      }}
      className={cn(
        'icon-inherit flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold transition',
        withLabel ? 'min-w-10 px-2.5 lg:px-3' : 'w-10',
        on
          ? dark
            ? 'text-white hover:bg-white/15'
            : 'text-guide-700 hover:bg-guide-50'
          : dark
            ? 'bg-white text-stop-600 hover:bg-stop-50'
            : 'bg-stop-50 text-stop-600 ring-1 ring-stop-500/40 hover:bg-stop-100',
      )}
    >
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      {withLabel && <span className="hidden text-sm lg:inline">{state}</span>}
    </button>
  );
}
