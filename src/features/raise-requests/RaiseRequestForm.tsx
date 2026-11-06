import { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, HandCoins, Hourglass, Send, TrendingUp } from 'lucide-react';
import type { RaiseReason, Worker } from '@/core/types';
import { RAISE_KEYS, RAISE_REASONS } from '@/core/catalog';
import { useI18n } from '@/shared/i18n';
import { Button, Card, CardHeader, Pictogram, Stepper, Tile, VoiceOrWrite } from '@/shared/ui';
import { REASON_ICON } from './meta';
import { useRaiseRequests } from './store';

export function RaiseRequestForm({ worker }: { worker: Worker }) {
  const i = useI18n();
  const { t, taka, num } = i;
  const request = useRaiseRequests((s) => s.request);
  const pending = useRaiseRequests((s) => s.requests.find((r) => r.workerId === worker.id && r.status === 'pending'));

  const [rate, setRate] = useState(worker.dailyRate + 100);
  const [reason, setReason] = useState<RaiseReason | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  if (pending) {
    return (
      <Card tone="alert" className="flex items-start gap-4">
        <Pictogram icon={Hourglass} tone="mark" size={56} />
        <div>
          <h2 className="font-sign text-2xl">{t('Your request is waiting', 'আপনার আবেদন অপেক্ষায় আছে')}</h2>
          <p className="mt-1 flex items-center gap-2 text-lg">
            {taka(pending.currentRate)}
            <ArrowRight className="h-5 w-5" aria-label={t('to', 'থেকে')} />
            {taka(pending.requestedRate)}
          </p>
          <p className="mt-1 text-ink-soft">{t('You can ask again after the office decides.', 'অফিস সিদ্ধান্ত দিলে আবার আবেদন করতে পারবেন।')}</p>
        </div>
      </Card>
    );
  }

  const max = Math.round((worker.dailyRate * 1.5) / 50) * 50;

  const send = () => {
    setError('');
    if (!reason) return setError(t('Tap a reason.', 'একটি কারণে চাপ দিন।'));
    if (!audio && details.trim().length < 10) return setError(t('Record your voice or write a few words.', 'কণ্ঠ রেকর্ড করুন অথবা কয়েকটি কথা লিখুন।'));
    request({ workerId: worker.id, currentRate: worker.dailyRate, requestedRate: rate, reason, details: details.trim(), audio: audio ?? undefined });
  };

  return (
    <Card>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <CardHeader
          icon={TrendingUp}
          title={t('Ask for more pay', 'বেতন বাড়ানোর আবেদন')}
          speak={{
            en: `Your daily pay is ${worker.dailyRate} taka. Choose the new pay, tap a reason, and tell us why. Then send.`,
            bn: `আপনার দৈনিক মজুরি ${num(worker.dailyRate)} টাকা। নতুন মজুরি বাছাই করুন, একটি কারণে চাপ দিন, আর কেন তা বলুন। তারপর পাঠান।`,
          }}
        />

        <div className="space-y-6">
          <Section n={1} title={t('How much do you want?', 'কত মজুরি চান?')}>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-4">
              <Pictogram icon={HandCoins} size={44} />
              <div>
                <p className="text-ink-soft">{t('Daily pay now', 'এখনকার দৈনিক মজুরি')}</p>
                <p className="font-sign text-3xl leading-none">{taka(worker.dailyRate)}</p>
              </div>
              <Pictogram icon={TrendingUp} size={44} />
              <div>
                <p className="mb-1 text-ink-soft">{t('Daily pay you want', 'যত মজুরি চান')}</p>
                <Stepper value={rate} step={50} min={worker.dailyRate + 50} max={max} size="lg" prefix="৳" label={t('New daily pay', 'নতুন দৈনিক মজুরি')} onChange={setRate} />
              </div>
            </div>
          </Section>

          <Section n={2} title={t('Why?', 'কেন?')}>
            <div className="grid grid-cols-2 gap-2">
              {RAISE_KEYS.map((k) => (
                <Tile key={k} icon={REASON_ICON[k]} tone="sign" shape="disc" label={RAISE_REASONS[k]} selected={reason === k} onPress={() => setReason(k)} />
              ))}
            </div>
          </Section>

          <Section n={3} title={t('Explain in your words', 'নিজের ভাষায় বলুন')}>
            <VoiceOrWrite audio={audio} onAudio={setAudio} text={details} onText={setDetails} rows={3} placeholder={{ en: 'For example: I drive the roller alone now.', bn: 'যেমন: এখন আমি একাই রোলার চালাই।' }} />
          </Section>

          {error && (
            <p role="alert" className="rounded-xl bg-stop-50 px-3 py-2.5 font-semibold text-stop-700">
              {error}
            </p>
          )}
          <Button type="submit" size="xl" className="w-full">
            <Send />
            {t('Send request', 'আবেদন পাঠান')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  const { num } = useI18n();
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2.5 text-lg font-semibold">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-guide-600 font-sign text-base text-white">{num(n)}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
