import { useMemo, useState } from 'react';
import { Bandage, Camera, ChevronRight, CircleCheck, Construction, LogOut, Package, Send, Thermometer, ThumbsUp, TriangleAlert, Users, Wallet } from 'lucide-react';
import type { Attendance, Health, IncidentKey, MaterialLine, Shift } from '@/core/types';
import { INCIDENTS, INCIDENT_KEYS, MATERIAL_BY_KEY } from '@/core/catalog';
import { applyPayEdits, calculatePayroll, payrollTotal } from '@/core/payroll';
import type { PayEdit } from '@/core/payroll';
import { kmToPct, pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { useHealthReports, todaysReport } from '@/features/health';
import { PayRules, PayrollList } from '@/features/payroll';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Badge, Button, Card, CardHeader, Field, PageHeader, PhotoPicker, RoadStrip, Segmented, StackBar, Stepper, Textarea, Tile, WizardSteps } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { cn, pct } from '@/shared/lib/utils';
import { useShiftStore } from '../model/store';
import { INCIDENT_ICON, MaterialPicto } from './icons';

const STEPS = [
  { icon: Users, label: { en: 'Count', bn: 'গণনা' } },
  { icon: Package, label: { en: 'Materials', bn: 'মালামাল' } },
  { icon: Construction, label: { en: 'Progress', bn: 'অগ্রগতি' } },
  { icon: Wallet, label: { en: 'Pay', bn: 'মজুরি' } },
];

const PRESENCE: SegmentOption<boolean>[] = [
  { value: true, icon: CircleCheck, label: { en: 'Here', bn: 'আছেন' }, tone: 'green' },
  { value: false, icon: LogOut, label: { en: 'Left', bn: 'চলে গেছেন' }, tone: 'red' },
];

const HEALTH: SegmentOption<Health>[] = [
  { value: 'fit', icon: ThumbsUp, label: { en: 'Well', bn: 'ভালো' }, tone: 'green' },
  { value: 'sick', icon: Thermometer, label: { en: 'Sick', bn: 'অসুস্থ' }, tone: 'yellow' },
  { value: 'injured', icon: Bandage, label: { en: 'Hurt', bn: 'আহত' }, tone: 'red' },
];

const WASTE_LIMIT = 5;

export function EndShiftWizard({ shift, onCancel, onEnded }: { shift: Shift; onCancel: () => void; onEnded: (id: string) => void }) {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const workers = useWorkforce((s) => s.workers);
  const endShift = useShiftStore((s) => s.endShift);
  const road = useRoad();
  const reports = useHealthReports((s) => s.reports);

  const [step, setStep] = useState(0);
  // A worker who told the app they are sick or hurt today starts marked that way.
  const [rows, setRows] = useState<Attendance[]>(() =>
    shift.attendance.map((a) => {
      const own = todaysReport(reports, a.workerId);
      return own && own.status !== 'fit' && a.health === 'fit' ? { ...a, health: own.status } : { ...a };
    }),
  );
  const [mats, setMats] = useState<MaterialLine[]>(() => shift.materials.map((m) => ({ ...m })));
  const startKm = pctToKm(shift.startProgress, road);
  const [endKm, setEndKm] = useState(startKm);
  const endProgress = Math.max(shift.startProgress, kmToPct(endKm, road));
  const [tags, setTags] = useState<IncidentKey[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [payEdits, setPayEdits] = useState<Record<string, PayEdit>>({});
  const [error, setError] = useState('');

  const preview = useMemo(() => applyPayEdits(calculatePayroll(workers, rows), payEdits), [workers, rows, payEdits]);
  const here = rows.filter((r) => r.presentAtEnd).length;
  const required: IncidentKey[] = [];
  if (mats.some((m) => pct(m.wasted, m.allocated) > WASTE_LIMIT)) required.push('waste');
  if (rows.some((r) => r.health === 'injured')) required.push('injury');

  const updateRow = (id: string, patch: Partial<Attendance>) => setRows((list) => list.map((r) => (r.workerId === id ? { ...r, ...patch } : r)));
  const updateMat = (idx: number, patch: Partial<MaterialLine>) => setMats((list) => list.map((m, j) => (j === idx ? { ...m, ...patch } : m)));
  const toggleTag = (k: IncidentKey) => setTags((list) => (list.includes(k) ? list.filter((x) => x !== k) : [...list, k]));

  const next = () => {
    setError('');
    if (step === 1) setTags((list) => Array.from(new Set([...list, ...required])));
    if (step === 2 && required.some((k) => !tags.includes(k))) {
      setError(t('Keep the problems marked "needed" selected.', '"দরকারি" লেখা সমস্যাগুলো বাছাই করা রাখুন।'));
      return;
    }
    if (step === 3) {
      const id = endShift(road.id, { attendance: rows, materials: mats, endProgress, incidentTags: tags, incidents: notes.trim(), photos, payEdits }, workers);
      if (id) onEnded(id);
      return;
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 pb-36">
      <PageHeader
        title={t('Finish the shift', 'শিফট শেষ করুন')}
        speak={{ en: 'Finish the shift in four steps.', bn: 'চারটি ধাপে শিফট শেষ করুন।' }}
      />
      <WizardSteps steps={STEPS} current={step} />

      {step === 0 && (
        <Card>
          <CardHeader
            icon={Users}
            title={t('Who is still here?', 'কে কে এখনো আছেন?')}
            subtitle={t(`${num(here)} of ${num(rows.length)} here`, `${num(rows.length)} জনের মধ্যে ${num(here)} জন আছেন`)}
            speak={{ en: 'Who is still here? Mark anyone who left, and anyone sick or hurt.', bn: 'কে কে এখনো আছেন? কেউ চলে গেলে, অসুস্থ বা আহত হলে চিহ্ন দিন।' }}
            action={
              here < rows.length ? (
                <Badge tone="red" icon={LogOut}>
                  {t(`${num(rows.length - here)} left`, `${num(rows.length - here)} জন চলে গেছেন`)}
                </Badge>
              ) : (
                <Badge tone="green" icon={CircleCheck}>
                  {t('Everyone is here', 'সবাই আছেন')}
                </Badge>
              )
            }
          />
          <ul className="space-y-3">
            {rows.map((r) => {
              const w = workers.find((x) => x.id === r.workerId);
              if (!w) return null;
              return (
                <li key={r.workerId} className={cn('rounded-2xl border-2 p-3 transition sm:p-4', r.presentAtEnd ? 'border-line' : 'border-stop-100 bg-stop-50/60')}>
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
                    <div className="flex items-center gap-3">
                      <Avatar person={w} size={56} dim={!r.presentAtEnd} />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold leading-tight">{personName(w, i.lang)}</p>
                        <p className="truncate text-sm text-ink-soft">{tx(roleOf(w))}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border-2 border-line p-2">
                      <p className="mb-1.5 px-1 text-sm font-semibold text-ink-soft">{t('On site', 'সাইটে')}</p>
                      <Segmented boxed label={t('On site', 'সাইটে')} options={PRESENCE} value={r.presentAtEnd} onChange={(v) => updateRow(r.workerId, { presentAtEnd: v })} />
                    </div>
                    <div className="rounded-2xl border-2 border-line p-2">
                      <p className="mb-1.5 px-1 text-sm font-semibold text-ink-soft">{t('Health', 'স্বাস্থ্য')}</p>
                      <Segmented boxed label={t('Health', 'স্বাস্থ্য')} options={HEALTH} value={r.health} onChange={(v) => updateRow(r.workerId, { health: v })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-sm leading-tight text-ink-soft">{t('Work done', 'কাজ')}</span>
                      <div className="flex-1">
                        <Stepper value={r.output} step={5} unit={t('m', 'মি.')} label={t('Metres done', 'কত মিটার')} onChange={(v) => updateRow(r.workerId, { output: v })} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader
            icon={Package}
            tone="plain"
            title={t('What was used?', 'কতটা মাল খরচ হলো?')}
            speak={{ en: 'What was used? Green is used, red is wasted, grey is left over.', bn: 'কতটা মাল খরচ হলো? সবুজ খরচ, লাল নষ্ট, ধূসর বাকি।' }}
          />
          <ul className="space-y-3">
            {mats.map((m, idx) => {
              const def = MATERIAL_BY_KEY[m.key];
              const left = m.allocated - m.used - m.wasted;
              const tooMuch = pct(m.wasted, m.allocated) > WASTE_LIMIT;
              return (
                <li key={m.key} className="rounded-2xl border border-line p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <MaterialPicto k={m.key} />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold leading-tight">{tx(def.name)}</p>
                      <p className="text-sm text-ink-soft">
                        {t('Given', 'দেওয়া হয়েছে')} {num(m.allocated)} {tx(def.unit)}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => updateMat(idx, { used: m.allocated - m.wasted })}>
                      <CircleCheck />
                      {t('All used', 'সব খরচ')}
                    </Button>
                  </div>
                  <StackBar
                    className="mt-3"
                    total={m.allocated}
                    parts={[
                      { value: m.used, className: 'bg-guide-500' },
                      { value: m.wasted, className: 'bg-stop-500' },
                    ]}
                  />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-sm font-semibold text-guide-700">
                        {t('Used', 'খরচ')}
                      </p>
                      <Stepper value={m.used} step={def.step} max={m.allocated - m.wasted} unit={tx(def.unit)} label={t('Used', 'খরচ')} onChange={(v) => updateMat(idx, { used: v })} />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-stop-600">
                        {t('Wasted', 'নষ্ট')}
                      </p>
                      <Stepper
                        value={m.wasted}
                        step={def.wasteStep}
                        max={m.allocated}
                        unit={tx(def.unit)}
                        label={t('Wasted', 'নষ্ট')}
                        tone="stop"
                        onChange={(v) => updateMat(idx, { wasted: v, used: Math.min(m.used, m.allocated - v) })}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
                    <span>
                      {t('Left over', 'বাকি')}: <b className="text-ink">{num(left)}</b> {tx(def.unit)}
                    </span>
                    {tooMuch && (
                      <Badge tone="red" icon={TriangleAlert}>
                        {t(`More than ${num(WASTE_LIMIT)}% wasted`, `${num(WASTE_LIMIT)}%-এর বেশি নষ্ট`)}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {step === 2 && (
        <>
          <Card>
            <CardHeader
              icon={Construction}
              tone="mark"
              title={t('How many km of road are done now?', 'এখন রাস্তার কত কিলোমিটার হয়েছে?')}
              speak={{ en: "How many kilometres of road are done now? The yellow part is today's work.", bn: 'এখন রাস্তার কত কিলোমিটার হয়েছে? হলুদ অংশ আজকের কাজ।' }}
            />
            <RoadStrip progress={endProgress} lengthKm={road.lengthKm} today={{ from: shift.startProgress, to: endProgress }} />
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="w-full max-w-xs">
                <Stepper value={endKm} step={0.05} decimals={2} min={startKm} max={road.lengthKm} unit={t('km', 'কিমি')} size="lg" label={t('Road done in km', 'কত কিমি হয়েছে')} onChange={setEndKm} />
              </div>
              <p className="font-sign text-3xl text-guide-700">= {fixed(endProgress)}%</p>
              <Badge tone="green" icon={Construction}>
                +{fixed(endKm - startKm, 2)} {t('km', 'কিমি')} {t('today', 'আজ')}
              </Badge>
            </div>
          </Card>
          <Card>
            <CardHeader
              icon={Camera}
              tone="sign"
              shape="disc"
              title={t('Photos of today’s work', 'আজকের কাজের ছবি')}
              speak={{ en: "Add photos of today's work. Tap Add photo.", bn: 'আজকের কাজের ছবি দিন। "ছবি যোগ করুন" চাপুন।' }}
            />
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </Card>
          <Card>
            <CardHeader
              icon={TriangleAlert}
              shape="warn"
              tone="stop"
              title={t('Any problems today?', 'আজ কোনো সমস্যা হয়েছে?')}
              speak={{ en: 'Any problems today? Tap everything that happened.', bn: 'আজ কোনো সমস্যা হয়েছে? যা যা হয়েছে সব চাপুন।' }}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {INCIDENT_KEYS.map((k) => (
                <Tile
                  key={k}
                  icon={INCIDENT_ICON[k]}
                  shape="warn"
                  tone="stop"
                  label={INCIDENTS[k]}
                  sub={required.includes(k) ? { en: 'Needed', bn: 'দরকারি' } : undefined}
                  selected={tags.includes(k)}
                  onPress={() => toggleTag(k)}
                />
              ))}
            </div>
            <div className="mt-4">
              <Field label={t('What happened? (optional)', 'কী হয়েছিল? (ঐচ্ছিক)')}>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('For example: 20 m redone because the slope was wrong.', 'যেমন: ঢাল ভুল হওয়ায় ২০ মিটার আবার করা হয়েছে।')}
                />
              </Field>
            </div>
          </Card>
        </>
      )}

      {step === 3 && (
        <Card>
          <CardHeader
            icon={Wallet}
            title={t('Check the pay list', 'মজুরির তালিকা দেখুন')}
            speak={{
              en: `Check the pay list. Total ${i.numEn(payrollTotal(preview))} taka. The office approves it before anyone is paid.`,
              bn: `মজুরির তালিকা দেখুন। মোট ${num(payrollTotal(preview))} টাকা। টাকা দেওয়ার আগে অফিস এটি অনুমোদন করবে।`,
            }}
          />
          <PayRules />
          <div className="mt-2">
            <PayrollList
              lines={preview}
              edits={payEdits}
              onEdit={(workerId, edit) =>
                setPayEdits((all) => {
                  const next = { ...all };
                  if (edit) next[workerId] = edit;
                  else delete next[workerId];
                  return next;
                })
              }
            />
          </div>
        </Card>
      )}

      <ActionBar
        onBack={step > 0 ? () => setStep(step - 1) : onCancel}
        backLabel={step > 0 ? undefined : t('Keep working', 'কাজ চলুক')}
        onNext={next}
        nextIcon={step === 3 ? Send : ChevronRight}
        nextLabel={step === 3 ? t('Send to office', 'অফিসে পাঠান') : t(`Next - ${STEPS[step + 1].label.en}`, `পরের ধাপ - ${STEPS[step + 1].label.bn}`)}
        error={error}
      />
    </div>
  );
}
