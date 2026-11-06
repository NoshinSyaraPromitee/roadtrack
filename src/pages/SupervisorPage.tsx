import { useSearchParams } from 'react-router-dom';
import { ChevronRight, HardHat, HeartPulse, Tractor } from 'lucide-react';
import { EquipmentBoard } from '@/features/equipment';
import { CrewHealth } from '@/features/health';
import { BreakReminder } from '@/features/reminders';
import { useRoad } from '@/features/road';
import {
  ActiveShiftPanel,
  EndShiftWizard,
  ShiftSummary,
  StartShiftWizard,
  StartWork,
  setupFor,
  useActiveShift,
  useDaySetupStore,
  useShiftStore,
} from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Sequence, TabBar } from '@/shared/ui';
import type { SequenceStep, TabItem } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const TAB_KEYS = ['work', 'machines', 'health'] as const;
type Tab = (typeof TAB_KEYS)[number];

const TABS: TabItem<Tab>[] = [
  { key: 'work', icon: HardHat, label: { en: "Today's work", bn: 'আজকের কাজ' } },
  { key: 'machines', icon: Tractor, label: { en: 'Machines', bn: 'মেশিন' } },
  { key: 'health', icon: HeartPulse, label: { en: 'Crew health', bn: 'শ্রমিকদের শরীর' } },
];

/** Before work starts the supervisor goes through these in order. A step opens only when the one before it is done. */
const SETUP_KEYS = ['plan', 'machines', 'health', 'start'] as const;
type SetupKey = (typeof SETUP_KEYS)[number];

const SETUP_LABEL: Record<SetupKey, { en: string; bn: string }> = {
  plan: { en: "Today's work", bn: 'আজকের কাজ' },
  machines: { en: 'Machines', bn: 'মেশিন' },
  health: { en: 'Crew health', bn: 'আজ শ্রমিকদের শরীর' },
  start: { en: 'Start work', bn: 'কাজ শুরু' },
};

/** The supervisor's day before work starts: plan, machines, health, then start. */
function DaySetupFlow() {
  const i = useI18n();
  const road = useRoad();
  const byRoad = useDaySetupStore((s) => s.byRoad);
  const update = useDaySetupStore((s) => s.update);
  const clear = useDaySetupStore((s) => s.clear);
  const setup = setupFor(byRoad, road.id);

  const done: Record<SetupKey, boolean> = { plan: !!setup.plan, machines: setup.machinesOk, health: setup.healthOk, start: false };
  const firstOpen = SETUP_KEYS.find((k) => !done[k]) ?? 'start';
  const [asked, setStep] = useUrlState<SetupKey>('step', firstOpen, SETUP_KEYS);
  // Nobody can jump past a step that is not finished, even from an old link.
  const step = SETUP_KEYS.indexOf(asked) <= SETUP_KEYS.indexOf(firstOpen) ? asked : firstOpen;

  const steps: SequenceStep<SetupKey>[] = SETUP_KEYS.map((k) => ({
    key: k,
    label: SETUP_LABEL[k],
    state: done[k] ? 'done' : SETUP_KEYS.indexOf(k) <= SETUP_KEYS.indexOf(firstOpen) ? 'todo' : 'locked',
  }));

  const go = (k: SetupKey) => {
    setStep(k);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-5">
      <Sequence steps={steps} current={step} onOpen={go} />

      {step === 'plan' && (
        <StartShiftWizard
          key={road.id}
          initial={setup.plan}
          onDone={(plan) => {
            update(road.id, { plan });
            go('machines');
          }}
        />
      )}

      {step === 'machines' && (
        <div className="space-y-5 pb-36">
          <EquipmentBoard />
          <ActionBar
            onBack={() => go('plan')}
            onNext={() => {
              update(road.id, { machinesOk: true });
              go('health');
            }}
            nextIcon={ChevronRight}
            nextLabel={i.t('Machines checked', 'মেশিন দেখা শেষ')}
          />
        </div>
      )}

      {step === 'health' && (
        <div className="space-y-5 pb-36">
          <CrewHealth />
          <ActionBar
            onBack={() => go('machines')}
            onNext={() => {
              update(road.id, { healthOk: true });
              go('start');
            }}
            nextIcon={ChevronRight}
            nextLabel={i.t('Health checked', 'শরীর দেখা শেষ')}
          />
        </div>
      )}

      {step === 'start' && setup.plan && <StartWork plan={setup.plan} onBack={() => go('health')} onStarted={() => clear(road.id)} />}
    </div>
  );
}

export function SupervisorPage() {
  const road = useRoad();
  const active = useActiveShift();
  const logBreak = useShiftStore((s) => s.logBreak);
  const [tab, setTab] = useUrlState<Tab>('tab', 'work', TAB_KEYS);
  const [params, setParams] = useSearchParams();
  // "Finish work" and the finished-shift summary are their own screens, so Back leaves them.
  const ending = params.get('view') === 'finish' && !!active;
  const summaryId = params.get('summary');

  const setView = (view: { finish?: boolean; summary?: string }, replace = false) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('view');
        p.delete('summary');
        p.delete('step');
        if (view.finish) p.set('view', 'finish');
        if (view.summary) p.set('summary', view.summary);
        return p;
      },
      { replace },
    );
    window.scrollTo({ top: 0 });
  };

  if (summaryId) return <ShiftSummary shiftId={summaryId} onClose={() => setView({}, true)} />;
  if (!active) return <DaySetupFlow key={road.id} />;
  if (ending) {
    return <EndShiftWizard key={active.id} shift={active} onCancel={() => setView({}, true)} onEnded={(id) => setView({ summary: id }, true)} />;
  }

  return (
    <div className="space-y-5">
      <TabBar items={TABS} value={tab} onChange={setTab} />
      {tab === 'work' && (
        <div className="space-y-5">
          <ActiveShiftPanel shift={active} onFinish={() => setView({ finish: true })} />
          <BreakReminder startedAt={active.startedAt} breaks={active.breaks} onLog={(type) => logBreak(road.id, type)} />
        </div>
      )}
      {tab === 'machines' && <EquipmentBoard />}
      {tab === 'health' && <CrewHealth />}
    </div>
  );
}
