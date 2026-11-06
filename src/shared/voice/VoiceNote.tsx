import { useRef, useState } from 'react';
import { Mic, Pause, Play } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';

const BARS = [8, 14, 20, 12, 18, 24, 10, 16, 22, 12, 18, 9, 15, 21, 11];

export function VoiceNote({ src }: { src: string }) {
  const { t } = useI18n();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-full bg-guide-50 p-1.5 pr-4">
      <button
        type="button"
        onClick={() => (playing ? audio.current?.pause() : void audio.current?.play())}
        aria-label={playing ? t('Pause', 'থামান') : t('Play voice message', 'কণ্ঠবার্তা শুনুন')}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-guide-600 text-white hover:bg-guide-700"
      >
        {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
      </button>
      <span className="flex h-6 flex-1 items-center gap-[3px]" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn('w-1 rounded-full bg-guide-500/70', playing && 'animate-pulse')}
            style={{ height: h, animationDelay: `${i * 70}ms` }}
          />
        ))}
      </span>
      <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
