import { ChevronRight } from 'lucide-react';
import { EquipmentBoard } from '@/features/equipment';
import { CrewHealth } from '@/features/health';
import { useRoad } from '@/features/road';
import { StartShiftWizard, StartWork, setupFor, useDaySetupStore } from '@/features/shift';
import { useI18n } from '@/shared/i18n';
import { ActionBar, Sequence } from '@/shared/ui';
import type { SequenceStep } from '@/shared/ui';
import { useUrlState } from '@/shared/lib/useUrlState';

const SETUP_KEYS = ['plan', 'machines', 'health', 'start'] as const;
type SetupKey = (typeof SETUP_KEYS)[number];

const SETUP_LABEL: Record<SetupKey, { en: string; bn: string }> = {
  plan: { en: "Today's work", bn: 'আজকের কাজ' },
  machines: { en: 'Machines', bn: 'মেশিন' },
  health: { en: 'Crew health', bn: 'আজ শ্রমিকদের স্বাস্থ্য' },
  start: { en: 'Start work', bn: 'কাজ শুরু' },
};

export function DaySetupFlow() {
  const i = useI18n();
  const road = useRoad();
  const byRoad = useDaySetupStore((s) => s.byRoad);
  const update = useDaySetupStore((s) => s.update);
  const clear = useDaySetupStore((s) => s.clear);
  const setup = setupFor(byRoad, road.id);

  const done: Record<SetupKey, boolean> = { plan: !!setup.plan, machines: setup.machinesOk, health: setup.healthOk, start: false };
  const firstOpen = SETUP_KEYS.find((k) => !done[k]) ?? 'start';
  const [asked, setStep] = useUrlState<SetupKey>('step', firstOpen, SETUP_KEYS);
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
            nextLabel={i.t('Health checked', 'স্বাস্থ্য দেখা শেষ')}
          />
        </div>
      )}

      {step === 'start' && setup.plan && <StartWork plan={setup.plan} onBack={() => go('health')} onStarted={() => clear(road.id)} />}
    </div>
  );
}
