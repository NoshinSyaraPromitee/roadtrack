import { useState } from 'react';
import { ChevronRight, CircleCheck, EyeOff, Megaphone, MessageCircleWarning, UserRound } from 'lucide-react';
import type { ComplaintCategory } from '@/core/types';
import { COMPLAINT_CATEGORIES, COMPLAINT_KEYS } from '@/core/catalog';
import { SUPERVISOR } from '@/core/seed';
import { PeoplePicker, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { SpeakButton, VoiceRecorder, useSay } from '@/shared/voice';
import { ActionBar, Button, Card, CardHeader, Field, Pictogram, Textarea, Tile, WizardSteps } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { CATEGORY_ICON } from './meta';
import { useComplaints } from './store';

const STEPS = [
  { icon: UserRound, label: { en: 'Who', bn: 'কে' } },
  { icon: MessageCircleWarning, label: { en: 'What', bn: 'কী' } },
  { icon: Megaphone, label: { en: 'Tell', bn: 'বলুন' } },
];

export function ComplaintWizard({ workerId }: { workerId: string }) {
  const i = useI18n();
  const { t } = i;
  const { hint } = useSay();
  const workers = useWorkforce((s) => s.workers);
  const file = useComplaints((s) => s.file);

  const [step, setStep] = useState(0);
  const [against, setAgainst] = useState<string | null>(null);
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const people = [SUPERVISOR, ...workers.filter((w) => w.id !== workerId)];

  const reset = () => {
    setStep(0);
    setAgainst(null);
    setCategory(null);
    setAudio(null);
    setMessage('');
    setAnonymous(false);
    setSent(false);
  };

  const next = () => {
    setError('');
    if (step === 0 && !against) return setError(t('Tap a person first.', 'আগে একজনের নামে চাপ দিন।'));
    if (step === 1 && !category) return setError(t('Tap what happened.', 'কী হয়েছে তা চাপুন।'));
    if (step === 2) {
      if (!audio && message.trim().length < 10) return setError(t('Record your voice or write a few words.', 'কণ্ঠ রেকর্ড করুন অথবা কয়েকটি কথা লিখুন।'));
      if (!against || !category) return;
      file({ fromWorkerId: workerId, againstId: against, category, message: message.trim(), audio: audio ?? undefined, anonymous });
      setSent(true);
      return;
    }
    setStep(step + 1);
  };

  if (sent) {
    return (
      <Card className="flex flex-col items-center py-8 text-center">
        <Pictogram icon={CircleCheck} size={88} />
        <h2 className="mt-4 font-sign text-3xl">{t('Complaint sent', 'অভিযোগ পাঠানো হয়েছে')}</h2>
        <p className="mt-1 text-lg text-ink-soft">{t('The head office will look into it.', 'প্রধান কার্যালয় বিষয়টি দেখবে।')}</p>
        <div className="mt-3">
          <SpeakButton text={{ en: 'Complaint sent. The head office will look into it.', bn: 'অভিযোগ পাঠানো হয়েছে। প্রধান কার্যালয় বিষয়টি দেখবে।' }} />
        </div>
        <Button size="lg" variant="secondary" className="mt-6" onClick={reset}>
          {t('Make another complaint', 'আরেকটি অভিযোগ করুন')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <WizardSteps steps={STEPS} current={step} />

      {step === 0 && (
        <Card>
          <CardHeader
            icon={UserRound}
            tone="stop"
            shape="warn"
            title={t('Who is it about?', 'কার বিষয়ে অভিযোগ?')}
            speak={{ en: 'Who is it about? Tap the person.', bn: 'কার বিষয়ে অভিযোগ? তার নামে চাপ দিন।' }}
          />
          <PeoplePicker people={people} selected={against ? [against] : []} onPick={setAgainst} size={64} className="sm:grid-cols-3 lg:grid-cols-3">
            <button
              type="button"
              aria-pressed={against === 'other'}
              onClick={() => {
                hint({ en: 'Someone else', bn: 'অন্য কেউ' });
                setAgainst('other');
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-1 pb-3 pt-4 text-center',
                against === 'other' ? 'border-guide-600 bg-guide-50' : 'border-transparent bg-white hover:border-line',
              )}
            >
              <Pictogram icon={UserRound} tone="muted" shape="disc" size={64} />
              <span className="font-semibold">{t('Someone else', 'অন্য কেউ')}</span>
            </button>
          </PeoplePicker>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader
            icon={MessageCircleWarning}
            tone="stop"
            shape="warn"
            title={t('What happened?', 'কী হয়েছে?')}
            speak={{ en: 'What happened? Tap a sign.', bn: 'কী হয়েছে? একটি চিহ্নে চাপ দিন।' }}
          />
          <div className="grid grid-cols-2 gap-2">
            {COMPLAINT_KEYS.map((k) => (
              <Tile key={k} icon={CATEGORY_ICON[k]} shape="warn" tone="stop" label={COMPLAINT_CATEGORIES[k]} selected={category === k} onPress={() => setCategory(k)} />
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader
            icon={Megaphone}
            tone="sign"
            shape="disc"
            title={t('Tell us what happened', 'কী হয়েছে বলুন')}
            speak={{ en: 'Tap the microphone and tell us what happened.', bn: 'মাইকে চাপ দিয়ে কী হয়েছে বলুন।' }}
          />
          <VoiceRecorder value={audio} onChange={setAudio} />
          <div className="mt-4">
            <Field label={t('Or write it', 'অথবা লিখুন')}>
              <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('When and where did it happen?', 'কখন, কোথায় হয়েছে?')} />
            </Field>
          </div>
          <div className="mt-4">
            <Tile
              layout="row"
              icon={EyeOff}
              tone="plain"
              shape="disc"
              label={{ en: 'Hide my name', bn: 'আমার নাম গোপন রাখুন' }}
              sub={{ en: 'The office will not see who sent it.', bn: 'কে পাঠিয়েছে অফিস তা দেখবে না।' }}
              selected={anonymous}
              onPress={() => setAnonymous((v) => !v)}
              className="w-full"
            />
          </div>
        </Card>
      )}

      <ActionBar
        fixed={false}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={next}
        nextVariant={step === 2 ? 'danger' : 'primary'}
        nextIcon={step === 2 ? Megaphone : ChevronRight}
        nextLabel={step === 2 ? t('Send complaint', 'অভিযোগ পাঠান') : t('Next', 'পরের ধাপ')}
        error={error}
      />
    </div>
  );
}