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
}: {
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const { tx } = useI18n();
  const { hint } = useSay();

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
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
              on ? cn('font-bold underline decoration-[3px] underline-offset-[7px]', ON[o.tone ?? 'neutral']) : 'font-semibold text-ink-soft/75 hover:text-ink',
            )}
          >
            {Icon && <Icon className={cn('shrink-0', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} strokeWidth={2.4} />}
            <span className="truncate">{tx(o.label)}</span>
          </button>
        );
      })}
    </div>
  );
}
