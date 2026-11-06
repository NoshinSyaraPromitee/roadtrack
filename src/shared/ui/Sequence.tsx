import type { CSSProperties } from 'react';
import { Check, Lock } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';

export interface SequenceStep<K extends string> {
  key: K;
  label: Text;
  /** done: finished. locked: cannot open until the step before it is finished. */
  state: 'done' | 'todo' | 'locked';
}

/** Steps that must be done in order. Finished steps can be opened again; locked ones cannot. */
export function Sequence<K extends string>({ steps, current, onOpen }: { steps: SequenceStep<K>[]; current: K; onOpen: (key: K) => void }) {
  const i = useI18n();
  const { hint } = useSay();

  return (
    <ol className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] gap-2" style={{ '--n': steps.length } as CSSProperties}>
      {steps.map((s, idx) => {
        const on = s.key === current;
        const locked = s.state === 'locked';
        return (
          <li key={s.key}>
            <button
              type="button"
              disabled={locked}
              aria-current={on ? 'step' : undefined}
              onClick={() => {
                hint(s.label);
                onOpen(s.key);
              }}
              className={cn('flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center transition', !locked && !on && 'hover:bg-black/5', locked && 'cursor-not-allowed')}
            >
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-full font-sign text-xl',
                  on && 'bg-sign-500 text-white',
                  !on && s.state === 'done' && 'bg-guide-600 text-white',
                  !on && s.state === 'todo' && 'bg-white text-ink ring-2 ring-inset ring-line',
                  locked && 'bg-black/[0.06] text-ink-soft/60',
                )}
              >
                {locked ? <Lock className="h-5 w-5" /> : s.state === 'done' && !on ? <Check className="h-6 w-6" strokeWidth={3} /> : i.num(idx + 1)}
              </span>
              <span className={cn('text-sm font-semibold leading-tight', on ? 'text-sign-600' : locked ? 'text-ink-soft/60' : s.state === 'done' ? 'text-guide-700' : 'text-ink')}>
                {i.tx(s.label)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
