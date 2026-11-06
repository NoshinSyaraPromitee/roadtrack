import { useMemo, useState } from 'react';
import { ChevronRight, Construction, Package, Send, Users, Wallet } from 'lucide-react';
import type { Attendance, IncidentKey, MaterialLine, Shift } from '@/core/types';
import { applyPayEdits, calculatePayroll, payrollTotal } from '@/core/payroll';
import type { PayEdit } from '@/core/payroll';
import { kmToPct, pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { useHealthReports, todaysReport } from '@/features/health';
import { PayRules, PayrollList } from '@/features/payroll';
import { useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Card, CardHeader, PageHeader, WizardSteps } from '@/shared/ui';
import { pct } from '@/shared/lib/utils';
import { useShiftStore } from '../model/store';
import { MaterialTotals } from './MaterialTotals';
import { MaterialsStep, WASTE_LIMIT } from './MaterialsStep';
import { CountStep } from './CountStep';
import { ProgressStep } from './ProgressStep';

const STEPS = [
  { icon: Users, label: { en: 'Count', bn: 'গণনা' } },
  { icon: Package, label: { en: 'Materials', bn: 'মালামাল' } },
  { icon: Construction, label: { en: 'Progress', bn: 'অগ্রগতি' } },
  { icon: Wallet, label: { en: 'Pay', bn: 'মজুরি' } },
];

export function EndShiftWizard({ shift, onCancel, onEnded }: { shift: Shift; onCancel: () => void; onEnded: (id: string) => void }) {
  const i = useI18n();
  const { t, num } = i;
  const workers = useWorkforce((s) => s.workers);
  const endShift = useShiftStore((s) => s.endShift);
  const road = useRoad();
  const reports = useHealthReports((s) => s.reports);

  const [step, setStep] = useState(0);
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

      {step === 0 && <CountStep rows={rows} updateRow={updateRow} />}

      {step === 1 && <MaterialTotals lines={mats} />}

      {step === 1 && <MaterialsStep mats={mats} updateMat={updateMat} />}

      {step === 2 && (
        <ProgressStep shift={shift} endKm={endKm} setEndKm={setEndKm} photos={photos} setPhotos={setPhotos} tags={tags} required={required} toggleTag={toggleTag} notes={notes} setNotes={setNotes} />
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
