import { useState } from 'react';
import { ChevronRight, Construction, MapPin, Package, Users } from 'lucide-react';
import type { MaterialKey, Text } from '@/core/types';
import { MATERIALS, POSTS } from '@/core/catalog';
import { kmToPct, pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { PeoplePicker, POST_ICON, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Badge, Button, Card, CardHeader, Chip, Field, Input, RoadStrip, Stepper, WizardSteps } from '@/shared/ui';
import type { DayPlan } from '../model/daySetup';
import { useProjectProgress } from '../model/selectors';
import { MaterialPicto } from './icons';

const STEPS = [
  { icon: Users, label: { en: 'Workers', bn: 'শ্রমিক' } },
  { icon: Package, label: { en: 'Materials', bn: 'মালামাল' } },
  { icon: MapPin, label: { en: 'Place', bn: 'স্থান' } },
];

/**
 * Step 1 of the supervisor's day: who came, the materials, and where the crew works.
 * It only saves the plan; work starts later, after the machines and the crew's health are checked.
 */
export function StartShiftWizard({ initial, onDone }: { initial?: DayPlan; onDone: (plan: DayPlan) => void }) {
  const { t, tx, num, fixed } = useI18n();
  const road = useRoad();
  const workers = useWorkforce((s) => s.workers);
  const lastProgress = useProjectProgress();

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(() => initial?.workerIds ?? workers.map((w) => w.id));
  const [qty, setQty] = useState(
    () =>
      Object.fromEntries(MATERIALS.map((m) => [m.key, initial?.materials.find((x) => x.key === m.key)?.allocated ?? m.defaultQty])) as Record<MaterialKey, number>,
  );
  const known = initial && road.places.some((p) => p.en === initial.site.en);
  const [site, setSite] = useState<Text>(known && initial ? initial.site : road.places[0]);
  const [other, setOther] = useState(initial && !known ? initial.site.en : '');
  const [km, setKm] = useState(() => pctToKm(initial?.startProgress ?? lastProgress, road));
  const progress = kmToPct(km, road);
  const [error, setError] = useState('');

  const everyone = selected.length === workers.length;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const crewByPost = Object.entries(
    workers.filter((w) => selected.includes(w.id)).reduce<Record<string, number>>((acc, w) => ({ ...acc, [w.post]: (acc[w.post] ?? 0) + 1 }), {}),
  ) as Array<[keyof typeof POSTS, number]>;

  const next = () => {
    if (step === 0 && selected.length === 0) {
      setError(t('Tap at least one worker.', 'অন্তত একজন শ্রমিক বাছাই করুন।'));
      return;
    }
    if (step === 2) {
      const place = other.trim() ? { en: other.trim(), bn: other.trim() } : site;
      if (!place.en) {
        setError(t('Choose where the crew is working.', 'কোথায় কাজ হচ্ছে তা বাছাই করুন।'));
        return;
      }
      onDone({ site: place, startProgress: progress, workerIds: selected, materials: MATERIALS.map((m) => ({ key: m.key, allocated: qty[m.key] })) });
      return;
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="space-y-5 pb-36">
      <WizardSteps steps={STEPS} current={step} />

      {step === 0 && (
        <Card>
          <CardHeader
            title={t('Who came today?', 'আজ কে কে এসেছেন?')}
            subtitle={t(`${num(selected.length)} of ${num(workers.length)} on site`, `${num(workers.length)} জনের মধ্যে ${num(selected.length)} জন এসেছেন`)}
            speak={{ en: 'Who came today? Tap a person to add or remove them.', bn: 'আজ কে কে এসেছেন? যোগ বা বাদ দিতে নামের উপর চাপ দিন।' }}
            action={
              <Button variant="secondary" onClick={() => setSelected(everyone ? [] : workers.map((w) => w.id))}>
                {everyone ? t('Clear all', 'সব বাদ দিন') : t('Everyone', 'সবাই')}
              </Button>
            }
          />
          <PeoplePicker people={workers} selected={selected} onPick={toggle} />
          {crewByPost.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {crewByPost.map(([post, count]) => (
                <Badge key={post} tone="green" icon={POST_ICON[post]}>
                  {num(count)} {tx(POSTS[post])}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader
            icon={Package}
            tone="plain"
            title={t('Materials for today', 'আজকের মালামাল')}
            subtitle={t('How much was given to the site?', 'সাইটে কতটা মাল দেওয়া হয়েছে?')}
            speak={{ en: 'Materials for today. Use plus and minus.', bn: 'আজকের মালামাল। যোগ আর বিয়োগ চিহ্ন ব্যবহার করুন।' }}
          />
          <ul className="space-y-1">
            {MATERIALS.map((m) => (
              <li key={m.key} className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
                <MaterialPicto k={m.key} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold leading-tight">{tx(m.name)}</p>
                  <p className="text-sm text-ink-soft">{t(`${num(m.step)} ${m.unit.en} per tap`, `প্রতি চাপে ${num(m.step)} ${m.unit.bn}`)}</p>
                </div>
                <div className="w-full sm:w-72">
                  <Stepper value={qty[m.key]} step={m.step} unit={tx(m.unit)} label={tx(m.name)} onChange={(v) => setQty((q) => ({ ...q, [m.key]: v }))} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {step === 2 && (
        <>
          <Card>
            <CardHeader
              icon={MapPin}
              title={t('Where is the crew working?', 'কোথায় কাজ হচ্ছে?')}
              subtitle={t(`On ${road.name.en}`, `${road.name.bn}-এ`)}
              speak={{ en: 'Where is the crew working? Tap a place.', bn: 'কোথায় কাজ হচ্ছে? একটি জায়গায় চাপ দিন।' }}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {road.places.map((p) => (
                <Chip
                  key={p.en}
                  selected={!other.trim() && site.en === p.en}
                  onClick={() => {
                    setOther('');
                    setSite(p);
                  }}
                  className="justify-start text-left text-lg"
                >
                  <MapPin />
                  {tx(p)}
                </Chip>
              ))}
            </div>
            <div className="mt-4 max-w-md">
              <Field label={t('Somewhere else? Write the place or address', 'অন্য কোথাও? জায়গা বা ঠিকানা লিখুন')}>
                <Input value={other} onChange={(e) => setOther(e.target.value)} placeholder={t('For example: in front of Ali Hardware, Station Road', 'যেমন: আলী হার্ডওয়্যারের সামনে, স্টেশন রোড')} />
              </Field>
            </div>
          </Card>
          <Card>
            <CardHeader
              icon={Construction}
              tone="mark"
              title={t('How many km of road are done?', 'রাস্তার কত কিলোমিটার হয়েছে?')}
              subtitle={t(`The whole road is ${fixed(road.lengthKm)} km. Last record: ${fixed(pctToKm(lastProgress, road), 2)} km`, `পুরো রাস্তা ${fixed(road.lengthKm)} কিমি। শেষ হিসাব: ${fixed(pctToKm(lastProgress, road), 2)} কিমি`)}
              speak={{ en: 'How many kilometres of the road are done? Use plus and minus.', bn: 'রাস্তার কত কিলোমিটার হয়েছে? যোগ আর বিয়োগ চিহ্ন ব্যবহার করুন।' }}
            />
            <RoadStrip progress={progress} lengthKm={road.lengthKm} />
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="w-full max-w-xs">
                <Stepper value={km} step={0.05} decimals={2} min={0} max={road.lengthKm} unit={t('km', 'কিমি')} size="lg" label={t('Road done in km', 'কত কিমি হয়েছে')} onChange={setKm} />
              </div>
              <p className="font-sign text-3xl text-guide-700">= {fixed(progress)}%</p>
            </div>
          </Card>
        </>
      )}

      <ActionBar
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={next}
        nextIcon={ChevronRight}
        nextLabel={step === 2 ? t('Next: machines', 'পরের ধাপ: মেশিন') : t('Next', 'পরের ধাপ')}
        error={error}
      />
    </div>
  );
}
