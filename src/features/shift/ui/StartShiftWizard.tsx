import { useState } from 'react';
import { ChevronRight, Construction, MapPin, Package, Play, Users } from 'lucide-react';
import type { MaterialKey } from '@/core/types';
import { MATERIALS, POSTS, SITE_SEGMENTS } from '@/core/catalog';
import { PROJECT } from '@/core/seed';
import { PeoplePicker, POST_ICON, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Badge, Button, Card, CardHeader, Chip, Field, Input, PageHeader, RoadStrip, Stepper, WizardSteps } from '@/shared/ui';
import { useShiftStore } from '../model/store';
import { useProjectProgress } from '../model/selectors';
import { MaterialPicto } from './icons';

const STEPS = [
  { icon: Users, label: { en: 'Workers', bn: 'শ্রমিক' } },
  { icon: Package, label: { en: 'Materials', bn: 'মালামাল' } },
  { icon: MapPin, label: { en: 'Place', bn: 'স্থান' } },
];

export function StartShiftWizard() {
  const { t, tx, num, fixed } = useI18n();
  const workers = useWorkforce((s) => s.workers);
  const startShift = useShiftStore((s) => s.startShift);
  const lastProgress = useProjectProgress();

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(() => workers.map((w) => w.id));
  const [qty, setQty] = useState(() => Object.fromEntries(MATERIALS.map((m) => [m.key, m.defaultQty])) as Record<MaterialKey, number>);
  const [site, setSite] = useState(SITE_SEGMENTS[1]);
  const [progress, setProgress] = useState(lastProgress);
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
      if (!site.trim()) {
        setError(t('Choose where the crew is working.', 'কোথায় কাজ হচ্ছে তা বাছাই করুন।'));
        return;
      }
      startShift({ site: site.trim(), startProgress: progress, workerIds: selected, materials: MATERIALS.map((m) => ({ key: m.key, allocated: qty[m.key] })) });
      return;
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="space-y-5 pb-36">
      <PageHeader
        title={t("Start today's work", 'আজকের কাজ শুরু করুন')}
        subtitle={t('Three short steps. Tap, do not type.', 'তিনটি ছোট ধাপ। লিখতে হবে না, শুধু চাপ দিন।')}
        speak={{ en: "Start today's work. Three short steps.", bn: 'আজকের কাজ শুরু করুন। তিনটি ছোট ধাপ।' }}
      />
      <WizardSteps steps={STEPS} current={step} />

      {step === 0 && (
        <Card>
          <CardHeader
            icon={Users}
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
          <ul className="divide-y divide-line">
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
              subtitle={t('Chainage on the road', 'রাস্তার চেইনেজ')}
              speak={{ en: 'Where is the crew working?', bn: 'কোথায় কাজ হচ্ছে?' }}
            />
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {SITE_SEGMENTS.map((s) => (
                <Chip key={s} selected={site === s} onClick={() => setSite(s)} className="font-sign text-lg">
                  <MapPin />
                  {s}
                </Chip>
              ))}
            </div>
            <div className="mt-4 max-w-sm">
              <Field label={t('Somewhere else', 'অন্য কোথাও')}>
                <Input value={SITE_SEGMENTS.includes(site) ? '' : site} onChange={(e) => setSite(e.target.value)} placeholder={t('Type the chainage', 'চেইনেজ লিখুন')} />
              </Field>
            </div>
          </Card>
          <Card>
            <CardHeader
              icon={Construction}
              tone="mark"
              title={t('How much road is done?', 'রাস্তার কতটা কাজ হয়েছে?')}
              subtitle={t(`Last record: ${fixed(lastProgress)}%`, `শেষ হিসাব: ${fixed(lastProgress)}%`)}
              speak={{ en: 'How much of the road is done?', bn: 'রাস্তার কতটা কাজ হয়েছে?' }}
            />
            <RoadStrip progress={progress} lengthKm={PROJECT.lengthKm} />
            <div className="mt-5 max-w-xs">
              <Stepper value={progress} step={0.5} decimals={1} min={0} max={100} unit="%" size="lg" label={t('Road done', 'রাস্তার কাজ')} onChange={setProgress} />
            </div>
          </Card>
        </>
      )}

      <ActionBar
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={next}
        nextIcon={step === 2 ? Play : ChevronRight}
        nextLabel={step === 2 ? t('Start work', 'কাজ শুরু করুন') : t('Next', 'পরের ধাপ')}
        error={error}
      />
    </div>
  );
}