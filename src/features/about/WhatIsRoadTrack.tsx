import { useRef } from 'react';
import { HardHat, ClipboardCheck, Building2, Info, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Button } from '@/shared/ui';
import { SpeakButton } from '@/shared/voice';

const INTRO: Text = {
  en: 'RoadTrack is a road construction tracker for Bangladesh. It is built so that workers who cannot read can still use it, with voice help, big pictures and Bangla.',
  bn: 'রোডট্র্যাক বাংলাদেশের রাস্তা নির্মাণের কাজ ট্র্যাক করার একটি অ্যাপ। যাঁরা পড়তে পারেন না, তাঁরাও যেন ব্যবহার করতে পারেন, তাই আছে কণ্ঠস্বর সহায়তা, বড় ছবি ও বাংলা ভাষা।',
};

const ROLES: Array<{ icon: typeof HardHat; title: Text; body: Text }> = [
  {
    icon: HardHat,
    title: { en: 'Worker', bn: 'শ্রমিক' },
    body: { en: 'See your pay, check in on your health and send a complaint.', bn: 'নিজের মজুরি দেখুন, শারীরিক অবস্থা জানান এবং অভিযোগ পাঠান।' },
  },
  {
    icon: ClipboardCheck,
    title: { en: 'Supervisor', bn: 'সুপারভাইজার' },
    body: { en: 'Start and finish the day’s shift: pick the crew, give out materials and mark the place.', bn: 'দিনের কাজ শুরু ও শেষ করুন: দল বাছুন, মালামাল দিন এবং জায়গা ঠিক করুন।' },
  },
  {
    icon: Building2,
    title: { en: 'Head office', bn: 'প্রধান কার্যালয়' },
    body: { en: 'Follow road progress, approve pay and read complaints.', bn: 'রাস্তার অগ্রগতি দেখুন, মজুরি অনুমোদন করুন এবং অভিযোগ পড়ুন।' },
  },
];

export function WhatIsRoadTrack() {
  const { t, tx } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => dialogRef.current?.showModal()}>
        <Info aria-hidden="true" />
        {t('What is RoadTrack?', 'রোডট্র্যাক কী?')}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="what-is-roadtrack-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(92vw,40rem)] max-h-[90vh] overflow-y-auto rounded-[18px] border border-line bg-white p-0 text-ink backdrop:bg-black/50"
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 id="what-is-roadtrack-title" className="font-sign text-3xl leading-tight">
                {t('What is RoadTrack?', 'রোডট্র্যাক কী?')}
              </h2>
              <SpeakButton text={INTRO} />
            </div>
            <Button variant="ghost" size="sm" onClick={close} aria-label={t('Close', 'বন্ধ করুন')}>
              <X aria-hidden="true" />
            </Button>
          </div>

          <p className="mb-5 text-lg leading-relaxed">{tx(INTRO)}</p>

          <ul className="grid gap-3">
            {ROLES.map((r) => (
              <li key={r.title.en} className="flex items-start gap-3 rounded-xl bg-guide-50 p-3">
                <r.icon className="mt-0.5 size-6 shrink-0 text-guide-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{tx(r.title)}</h3>
                  <p className="text-ink-soft">{tx(r.body)}</p>
                </div>
              </li>
            ))}
          </ul>

          <Button className="mt-5 w-full" onClick={close}>
            {t('Got it', 'বুঝেছি')}
          </Button>
        </div>
      </dialog>
    </>
  );
}