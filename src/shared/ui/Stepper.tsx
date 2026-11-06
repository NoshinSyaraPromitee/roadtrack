import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { clamp, cn, parseNum } from '@/shared/lib/utils';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  prefix?: string;
  label?: string;
  decimals?: number;
  size?: 'md' | 'lg';
  /** 'stop' turns the buttons and the number red, for things that are lost or wasted. */
  tone?: 'plain' | 'stop';
}

/** Big minus and plus buttons so nobody has to type a number. Tap the number to type it instead. */
export function Stepper({ value, onChange, step = 1, min = 0, max = Number.POSITIVE_INFINITY, unit, prefix, label, decimals = 0, size = 'md', tone = 'plain' }: StepperProps) {
  const { t, num, fixed } = useI18n();
  const [draft, setDraft] = useState<string | null>(null);
  const round = (v: number) => Math.round(v * 10 ** decimals) / 10 ** decimals;
  const set = (v: number) => onChange(round(clamp(v, min, max)));
  const big = size === 'lg';

  const commit = () => {
    if (draft !== null) {
      const n = parseNum(draft);
      if (!Number.isNaN(n)) set(n);
    }
    setDraft(null);
  };

  const red = tone === 'stop';
  const btn = cn(
    'grid shrink-0 place-items-center rounded-xl bg-white ring-1 ring-inset transition disabled:opacity-35',
    red ? 'text-stop-600 ring-stop-500/40' : 'text-ink ring-line',
    big ? 'h-14 w-14 [&_svg]:size-7' : 'h-12 w-12 [&_svg]:size-6',
  );

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= min} aria-label={t('Less', 'কম')}>
        <Minus strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1 text-center">
        {draft !== null ? (
          <input
            autoFocus
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            aria-label={label}
            className={cn('w-full rounded-lg border-2 border-sign-500 bg-white px-2 text-center font-sign tabular-nums outline-none', big ? 'h-14 text-3xl' : 'h-12 text-2xl')}
          />
        ) : (
          <button
            type="button"
            onClick={() => setDraft(String(value))}
            className="w-full rounded-lg px-1 py-1 leading-none hover:bg-black/5"
            title={t('Tap to type a number', 'সংখ্যা লিখতে চাপ দিন')}
          >
            <span className={cn('font-sign tabular-nums', red && 'text-stop-600', big ? 'text-4xl' : 'text-[1.7rem]')}>
              {prefix}
              {decimals ? fixed(value, decimals) : num(value)}
            </span>
            {unit && <span className={cn('ml-1 text-sm', red ? 'text-stop-600' : 'text-ink-soft')}>{unit}</span>}
          </button>
        )}
      </div>
      <button type="button" className={btn} onClick={() => set(value + step)} disabled={value >= max} aria-label={t('More', 'বেশি')}>
        <Plus strokeWidth={3} />
      </button>
    </div>
  );
}
