import { useState } from 'react';
import { ChevronRight, EyeOff, Megaphone, MessageCircleWarning, UserRound } from 'lucide-react';
import type { ComplaintCategory } from '@/core/types';
import { COMPLAINT_CATEGORIES, COMPLAINT_KEYS } from '@/core/catalog';
import { SUPERVISOR } from '@/data/seed';
import { PeoplePicker, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { ActionBar, Card, CardHeader, confirmSent, Pictogram, Tile, VoiceOrWrite, WizardSteps } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { CATEGORY_ICON } from './meta';
import { useComplaintReceipts, useComplaints } from './store';
import { ComplaintSent } from './ComplaintSent';

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
  const keepReceipt = useComplaintReceipts((s) => s.keep);

  const [step, setStep] = useState(0);
  const [against, setAgainst] = useState<string | null>(null);
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const people = [SUPERVISOR, ...workers].filter((p) => p.id !== workerId);

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
      if (!audio && !message.trim()) return setError(t('Record your voice or write something.', 'কণ্ঠ রেকর্ড করুন অথবা কিছু লিখুন।'));
      if (!against || !category) return;
      const id = file({ fromWorkerId: workerId, againstId: against, category, message: message.trim(), audio: audio ?? undefined, anonymous });
      if (anonymous) keepReceipt(workerId, id);
      setSent(true);
      confirmSent({ en: 'Complaint sent', bn: 'অভিযোগ পাঠানো হয়েছে' });
      return;
    }
    setStep(step + 1);
  };

  if (sent) {
    return <ComplaintSent onAgain={reset} />;
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
                against === 'other' ? 'border-guide-600 bg-white hover:bg-guide-50' : 'border-transparent bg-white hover:border-guide-600 hover:bg-guide-50',
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
          <VoiceOrWrite audio={audio} onAudio={setAudio} text={message} onText={setMessage} rows={3} placeholder={{ en: 'When and where did it happen?', bn: 'কখন, কোথায় হয়েছে?' }} />
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
