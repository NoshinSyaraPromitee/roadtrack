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

const ON: Record<NonNullable<SegmentOption<unknown>['tone']>, string> = {
  green: 'bg-guide-600 text-white',
  yellow: 'bg-mark-400 text-ink',
  red: 'bg-stop-500 text-white',
  blue: 'bg-sign-500 text-white',
  neutral: 'bg-ink text-white',
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
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-2xl bg-paper p-1">
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
              'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 font-semibold transition',
              size === 'sm' ? 'h-9 text-sm' : 'h-12 text-base',
              on ? ON[o.tone ?? 'neutral'] : 'text-ink-soft hover:bg-white/70 hover:text-ink',
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