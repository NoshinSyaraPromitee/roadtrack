import { useEffect, useRef, useState } from 'react';
import { Bell, Coffee, Cookie, Timer } from 'lucide-react';
import type { BreakLog, BreakType } from '@/core/types';
import { getBreakStatus } from '@/core/reminderPolicy';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { SpeakButton, speak } from '@/shared/voice';
import { Badge, Button, Card, Pictogram } from '@/shared/ui';
import { useNow } from '@/shared/lib/useNow';

const COPY: Record<BreakType, { title: Text; text: Text }> = {
  rest: {
    title: { en: 'Time to rest', bn: 'বিশ্রামের সময়' },
    text: {
      en: 'Let everyone sit in the shade for 15 minutes with drinking water. Check on older and sick workers first.',
      bn: 'সবাইকে ১৫ মিনিট ছায়ায় বসতে দিন, পানি দিন। আগে বয়স্ক ও অসুস্থদের খোঁজ নিন।',
    },
  },
  snack: {
    title: { en: 'Snack time', bn: 'নাস্তার সময়' },
    text: {
      en: 'Give tea, bread or bananas and water. Rest for 20 to 30 minutes.',
      bn: 'চা, রুটি বা কলা আর পানি দিন। ২০ থেকে ৩০ মিনিট বিশ্রাম দিন।',
    },
  },
};

const LOGGED: Record<BreakType, Text> = {
  rest: { en: 'Rest given', bn: 'বিশ্রাম দিয়েছি' },
  snack: { en: 'Snacks given', bn: 'নাস্তা দিয়েছি' },
};

const canNotify = () => typeof window !== 'undefined' && 'Notification' in window;

export function BreakReminder({ startedAt, breaks, onLog }: { startedAt: string; breaks: BreakLog[]; onLog: (type: BreakType) => void }) {
  const i = useI18n();
  const now = useNow();
  const status = getBreakStatus(startedAt, breaks, now);
  // The last break given is the selected one; only it is coloured and reacts to hover.
  const last = breaks[breaks.length - 1]?.type;
  const due = status.due;
  const [permission, setPermission] = useState<NotificationPermission>(() => (canNotify() ? Notification.permission : 'denied'));
  const announced = useRef('');

  useEffect(() => {
    if (!due) return;
    const key = `${due}-${breaks.length}`;
    if (announced.current === key) return;
    announced.current = key;
    const copy = COPY[due];
    speak({ en: `${copy.title.en}. ${copy.text.en}`, bn: `${copy.title.bn}। ${copy.text.bn}` }, i.lang);
    if (canNotify() && Notification.permission === 'granted') new Notification(`RoadTrack: ${i.tx(copy.title)}`, { body: i.tx(copy.text) });
    navigator.vibrate?.([300, 120, 300]);
  }, [due, breaks.length, i]);

  const logButtons = (size: 'lg' | 'xl') => (
    <div className="grid gap-3 sm:grid-cols-2">
      {(['rest', 'snack'] as const).map((type) => {
        const Icon = type === 'rest' ? Coffee : Cookie;
        const selected = last === type;
        return (
          <Button
            key={type}
            variant={selected ? 'chosen' : 'choice'}
            size={size}
            aria-pressed={selected}
            onClick={() => onLog(type)}
          >
            <Icon />
            {i.tx(LOGGED[type])}
          </Button>
        );
      })}
    </div>
  );

  return (
    <Card tone={due ? 'alert' : 'plain'}>
      {due ? (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Pictogram icon={due === 'snack' ? Cookie : Coffee} shape="warn" tone="stop" size={84} className="animate-bounce" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-sign text-3xl leading-tight">{i.tx(COPY[due].title)}</h2>
                <SpeakButton size="sm" text={{ en: `${COPY[due].title.en}. ${COPY[due].text.en}`, bn: `${COPY[due].title.bn}। ${COPY[due].text.bn}` }} />
              </div>
              <p className="mt-1 text-lg">{i.tx(COPY[due].text)}</p>
            </div>
          </div>
          {logButtons('xl')}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Pictogram icon={status.nextType === 'snack' ? Cookie : Coffee} tone="sign" shape="disc" size={64} />
            <div className="min-w-0 flex-1">
              <p className="text-ink-soft">{status.nextType === 'snack' ? i.t('Next snack in', 'পরের নাস্তা') : i.t('Next rest in', 'পরের বিশ্রাম')}</p>
              <p className="font-sign text-5xl leading-none tabular-nums">{i.dur(status.msUntilNext)}</p>
            </div>
            <SpeakButton
              text={{
                en: `Next ${status.nextType} in ${Math.ceil(status.msUntilNext / 60000)} minutes. The phone will ring and speak when it is time.`,
                bn: `পরের ${status.nextType === 'snack' ? 'নাস্তা' : 'বিশ্রাম'} ${i.num(Math.ceil(status.msUntilNext / 60000))} মিনিট পরে। সময় হলে ফোন বেজে উঠবে ও বলে দেবে।`,
              }}
            />
          </div>
          {logButtons('lg')}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Timer className="h-5 w-5 text-ink-soft" aria-hidden="true" />
        {breaks.length === 0 ? (
          <span className="text-ink-soft">{i.t('No breaks given yet', 'এখনো কোনো বিরতি দেওয়া হয়নি')}</span>
        ) : (
          breaks.map((b) => (
            <Badge key={b.id} tone={b.type === 'snack' ? 'yellow' : 'blue'} icon={b.type === 'snack' ? Cookie : Coffee}>
              {i.time(b.at)}
            </Badge>
          ))
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {canNotify() && permission !== 'granted' && (
            <Button variant="ghost" size="sm" onClick={async () => setPermission(await Notification.requestPermission())}>
              <Bell />
              {i.t('Phone alerts', 'ফোনে সতর্কবার্তা')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
