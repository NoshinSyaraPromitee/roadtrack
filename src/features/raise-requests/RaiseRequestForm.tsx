import { useState } from 'react';
import { ArrowRight, HandCoins, Hourglass, MessageSquareText, Send, TrendingUp } from 'lucide-react';
import type { RaiseReason, Worker } from '@/core/types';
import { RAISE_KEYS, RAISE_REASONS } from '@/core/catalog';
import { useI18n } from '@/shared/i18n';
import { VoiceRecorder } from '@/shared/voice';
import { ActionBar, Card, CardHeader, Field, Pictogram, Stepper, Textarea, Tile } from '@/shared/ui';
import { REASON_ICON } from './meta';
import { useRaiseRequests } from './store';

export function RaiseRequestForm({ worker }: { worker: Worker }) {
  const i = useI18n();
  const { t, taka, num, fixed } = i;
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
  const increase = ((rate - worker.dailyRate) / worker.dailyRate) * 100;

  const send = () => {
    setError('');
    if (!reason) return setError(t('Tap a reason.', 'একটি কারণে চাপ দিন।'));
    if (!audio && details.trim().length < 10) return setError(t('Record your voice or write a few words.', 'কণ্ঠ রেকর্ড করুন অথবা কয়েকটি কথা লিখুন।'));
    request({ workerId: worker.id, currentRate: worker.dailyRate, requestedRate: rate, reason, details: details.trim(), audio: audio ?? undefined });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          icon={TrendingUp}
          title={t('Ask for more pay', 'বেতন বাড়ানোর আবেদন')}
          speak={{
            en: `Your daily pay is ${worker.dailyRate} taka. Use plus and minus to choose the new pay.`,
            bn: `আপনার দৈনিক মজুরি ${num(worker.dailyRate)} টাকা। নতুন মজুরি বাছাই করতে যোগ আর বিয়োগ চিহ্ন ব্যবহার করুন।`,
          }}
        />
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-4">
          <Pictogram icon={HandCoins} tone="muted" size={44} />
          <div>
            <p className="text-ink-soft">{t('Daily pay now', 'এখনকার দৈনিক মজুরি')}</p>
            <p className="font-sign text-3xl leading-none">{taka(worker.dailyRate)}</p>
          </div>
          <Pictogram icon={TrendingUp} size={44} />
          <div>
            <p className="mb-1 text-ink-soft">{t('Daily pay you want', 'যত মজুরি চান')}</p>
            <Stepper value={rate} step={50} min={worker.dailyRate + 50} max={max} size="lg" prefix="৳" label={t('New daily pay', 'নতুন দৈনিক মজুরি')} onChange={setRate} />
            <p className="mt-1 font-semibold text-guide-700">
              +{taka(rate - worker.dailyRate)} {t('a day', 'প্রতিদিন')} (+{fixed(increase)}%)
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('Why?', 'কেন?')} speak={{ en: 'Why? Tap a reason.', bn: 'কেন? একটি কারণে চাপ দিন।' }} />
        <div className="grid grid-cols-2 gap-2">
          {RAISE_KEYS.map((k) => (
            <Tile key={k} icon={REASON_ICON[k]} tone="sign" shape="disc" label={RAISE_REASONS[k]} selected={reason === k} onPress={() => setReason(k)} />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={MessageSquareText} tone="sign" shape="disc" title={t('Explain in your words', 'নিজের ভাষায় বলুন')} />
        <VoiceRecorder value={audio} onChange={setAudio} />
        <div className="mt-4">
          <Field label={t('Or write it', 'অথবা লিখুন')}>
            <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t('For example: I drive the roller alone now.', 'যেমন: এখন আমি একাই রোলার চালাই।')} />
          </Field>
        </div>
      </Card>

      <ActionBar fixed={false} onNext={send} nextIcon={Send} nextLabel={t('Send request', 'আবেদন পাঠান')} error={error} />
    </div>
  );
}