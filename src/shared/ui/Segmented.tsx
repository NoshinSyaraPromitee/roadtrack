import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export interface SegmentOption<V> {
  value: V;
  label: Text;
  icon?: IconType;
  tone?: 'green' | 'yellow' | 'red' | 'blue' | 'neutral';
}

/** In a box: every option has its own border; the chosen one takes its colour. */
const BOXED_ON: Record<NonNullable<SegmentOption<unknown>['tone']>, string> = {
  green: 'border-guide-600 bg-guide-50 text-guide-700',
  yellow: 'border-mark-400 bg-mark-100 text-[#9a5b00]',
  red: 'border-stop-500 bg-stop-50 text-stop-600',
  blue: 'border-sign-500 bg-sign-50 text-sign-600',
  neutral: 'border-ink bg-paper text-ink',
};

/** The chosen option is shown by colour only: coloured, bold, underlined text. No pill, no background. */
const ON: Record<NonNullable<SegmentOption<unknown>['tone']>, string> = {
  green: 'text-guide-700 decoration-guide-600',
  yellow: 'text-[#9a5b00] decoration-mark-400',
  red: 'text-stop-600 decoration-stop-500',
  blue: 'text-sign-600 decoration-sign-500',
  neutral: 'text-ink decoration-ink',
};

export function Segmented<V extends string | boolean>({
  options,
  value,
  onChange,
  size = 'md',
  label,
  boxed = false,
}: {
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  size?: 'sm' | 'md';
  label?: string;
  boxed?: boolean;
}) {
  const { tx } = useI18n();
  const { hint } = useSay();

  return (
    <div role="radiogroup" aria-label={label} className={cn('flex', boxed ? 'gap-1.5' : 'gap-1')}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              hint(o.label);
              onChange(o.value);
            }}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 transition',
              size === 'sm' ? 'h-9 text-sm' : 'h-12 text-base',
              'font-semibold',
              boxed
                ? cn('rounded-xl border-2', on ? BOXED_ON[o.tone ?? 'neutral'] : 'border-line bg-white text-ink-soft hover:border-ink-soft/40 hover:text-ink')
                : on
                  ? cn('underline decoration-[3px] underline-offset-[7px]', ON[o.tone ?? 'neutral'])
                  : 'text-ink-soft/75 hover:text-ink',
            )}
          >
            <span className="truncate">{tx(o.label)}</span>
          </button>
        );
      })}
    </div>
  );
}
