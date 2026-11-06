import { Mic, MicOff, Square, Trash2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { useRecorder } from './useRecorder';
import { VoiceNote } from './VoiceNote';

export function VoiceRecorder({ value, onChange }: { value: string | null; onChange: (audio: string | null) => void }) {
  const { t, num } = useI18n();
  const rec = useRecorder(onChange, 30);
  const clock = (s: number) => `${num(Math.floor(s / 60))}:${num(s % 60).padStart(2, num(0))}`;

  if (value) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <VoiceNote src={value} />
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t('Delete recording', 'রেকর্ড মুছুন')}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-stop-50 text-stop-600 hover:bg-stop-100"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    );
  }

  if (rec.state === 'unsupported' || rec.state === 'denied') {
    return (
      <p className="flex items-center gap-3 rounded-2xl bg-paper p-4 text-sm text-ink-soft">
        <MicOff className="h-6 w-6 shrink-0" />
        {rec.state === 'denied'
          ? t('The microphone is blocked. Allow it in the browser, or write below.', 'মাইক্রোফোন বন্ধ আছে। ব্রাউজারে অনুমতি দিন, অথবা নিচে লিখুন।')
          : t('This phone cannot record. Please write below.', 'এই ফোনে রেকর্ড করা যায় না। নিচে লিখুন।')}
      </p>
    );
  }

  const recording = rec.state === 'recording';

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <button
        type="button"
        onClick={recording ? rec.stop : rec.start}
        aria-label={recording ? t('Stop recording', 'রেকর্ড থামান') : t('Start recording', 'রেকর্ড শুরু করুন')}
        className={cn(
          'relative grid h-24 w-24 place-items-center rounded-full text-white transition',
          recording ? 'bg-stop-500' : 'bg-sign-500 hover:bg-sign-600',
        )}
      >
        {recording && <span className="absolute inset-0 animate-ping rounded-full bg-stop-500/40" />}
        {recording ? <Square className="relative h-9 w-9" fill="currentColor" /> : <Mic className="h-11 w-11" />}
      </button>
      <p className="text-lg font-semibold">
        {recording ? t('Recording. Tap to stop.', 'রেকর্ড হচ্ছে। থামাতে চাপ দিন।') : t('Tap the microphone and speak', 'মাইকে চাপ দিয়ে কথা বলুন')}
      </p>
      <p className="font-sign text-2xl tabular-nums text-ink-soft">
        {clock(rec.seconds)} / {clock(rec.maxSeconds)}
      </p>
    </div>
  );
}
