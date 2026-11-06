import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { VoiceRecorder } from '@/shared/voice';
import { Field, Textarea } from './Field';

export function VoiceOrWrite({
  audio,
  onAudio,
  text,
  onText,
  placeholder,
  rows = 3,
}: {
  audio: string | null;
  onAudio: (audio: string | null) => void;
  text: string;
  onText: (text: string) => void;
  placeholder: Text;
  rows?: number;
}) {
  const i = useI18n();
  return (
    <>
      <VoiceRecorder value={audio} onChange={onAudio} />
      <div className="mt-4">
        <Field label={i.t('Or write it', 'অথবা লিখুন')}>
          <Textarea rows={rows} value={text} onChange={(e) => onText(e.target.value)} placeholder={i.tx(placeholder)} />
        </Field>
      </div>
    </>
  );
}
