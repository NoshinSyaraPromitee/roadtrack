import { useState } from 'react';
import { CalendarDays, HeartPulse, Send } from 'lucide-react';
import type { Health, Worker } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import { SpeakButton, VoiceNote, VoiceRecorder } from '@/shared/voice';
import { ActionBar, Button, Card, CardHeader, EmptyState, Field, Pictogram, Textarea, Tile } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { HEALTH_ICON } from './meta';
import { HEALTH_LABEL, todaysReport } from './model';
import { useHealthReports } from './store';

const CHOICES: Health[] = ['fit', 'sick', 'injured'];

/** A worker tells the supervisor how they feel today, by tapping a sign and, if they want, by voice. */
export function HealthCheckIn({ worker }: { worker: Worker }) {
  const i = useI18n();
  const reports = useHealthReports((s) => s.reports);
  const report = useHealthReports((s) => s.report);
  const today = todaysReport(reports, worker.id);
  const [editing, setEditing] = useState(!today);
  const [status, setStatus] = useState<Health | null>(null);
  const [note, setNote] = useState('');
  const [audio, setAudio] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (today && !editing) {
    const m = HEALTH_ICON[today.status];
    const text = {
      en: `Today you said: ${HEALTH_LABEL[today.status].en}. The supervisor can see it.`,
      bn: `আজ আপনি জানিয়েছেন: ${HEALTH_LABEL[today.status].bn}। সুপারভাইজার এটি দেখতে পাবেন।`,
    };
    return (
      <Card className="flex flex-col items-center py-7 text-center">
        <Pictogram icon={m.icon} tone={m.tone} shape="disc" size={88} />
        <p className="mt-3 text-ink-soft">{i.t(`Sent at ${i.time(today.at)}`, `${i.time(today.at)}-এ পাঠানো`)}</p>
        <h2 className={cn('font-sign text-3xl', m.text)}>{i.tx(HEALTH_LABEL[today.status])}</h2>
        {today.note && <p className="mt-2 max-w-sm text-lg">{today.note}</p>}
        {today.audio && <VoiceNote src={today.audio} />}
        <div className="mt-3 flex items-center gap-2">
          <SpeakButton text={text} />
          <Button
            variant="secondary"
            onClick={() => {
              setStatus(null);
              setNote('');
              setAudio(null);
              setEditing(true);
            }}
          >
            {i.t('Change', 'বদলান')}
          </Button>
        </div>
      </Card>
    );
  }

  const send = () => {
    if (!status) return setError(i.t('Tap how you feel.', 'কেমন আছেন তা চাপুন।'));
    report({ workerId: worker.id, status, note: note.trim(), audio: audio ?? undefined });
    setError('');
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          icon={HeartPulse}
          tone="stop"
          shape="disc"
          title={i.t('How do you feel today?', 'আজ কেমন আছেন?')}
          subtitle={i.t('Your supervisor sees this before work starts.', 'কাজ শুরুর আগে সুপারভাইজার এটি দেখবেন।')}
          speak={{ en: 'How do you feel today? Tap one sign.', bn: 'আজ কেমন আছেন? একটি চিহ্নে চাপ দিন।' }}
        />
        <div className="grid grid-cols-3 gap-2">
          {CHOICES.map((c) => (
            <Tile key={c} icon={HEALTH_ICON[c].icon} tone={HEALTH_ICON[c].tone} shape="disc" size="lg" label={HEALTH_LABEL[c]} selected={status === c} onPress={() => setStatus(c)} />
          ))}
        </div>
      </Card>
      {status && status !== 'fit' && (
        <Card>
          <CardHeader title={i.t('Tell us more (if you want)', 'আরও বলুন (চাইলে)')} speak={{ en: 'Tap the microphone and say what is wrong.', bn: 'মাইকে চাপ দিয়ে কী সমস্যা বলুন।' }} />
          <VoiceRecorder value={audio} onChange={setAudio} />
          <div className="mt-4">
            <Field label={i.t('Or write it', 'অথবা লিখুন')}>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={i.t('For example: fever since last night', 'যেমন: গত রাত থেকে জ্বর')} />
            </Field>
          </div>
        </Card>
      )}
      <ActionBar fixed={false} onNext={send} nextIcon={Send} nextLabel={i.t('Send to supervisor', 'সুপারভাইজারকে পাঠান')} error={error} />
    </div>
  );
}

/** The last few days a worker reported. */
export function MyHealthHistory({ workerId }: { workerId: string }) {
  const i = useI18n();
  const reports = useHealthReports((s) => s.reports);
  const mine = reports.filter((r) => r.workerId === workerId).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7);

  return (
    <Card>
      <CardHeader icon={CalendarDays} tone="plain" title={i.t('What I told before', 'আগে যা জানিয়েছি')} />
      {mine.length === 0 ? (
        <EmptyState icon={HeartPulse} title={i.t('Nothing sent yet', 'এখনো কিছু পাঠানো হয়নি')} />
      ) : (
        <ul className="divide-y divide-line">
          {mine.map((r) => {
            const m = HEALTH_ICON[r.status];
            return (
              <li key={r.id} className="flex items-center gap-3 py-2.5">
                <Pictogram icon={m.icon} tone={m.tone} shape="disc" size={36} />
                <div className="min-w-0 flex-1">
                  <p className={cn('font-semibold', m.text)}>{i.tx(HEALTH_LABEL[r.status])}</p>
                  {r.note && <p className="truncate text-sm text-ink-soft">{r.note}</p>}
                </div>
                <span className="text-sm text-ink-soft">
                  {i.date(r.at)}, {i.time(r.at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
