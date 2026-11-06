import type { ReactNode } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { Button } from './Button';
import type { IconType } from './icons';

export function WizardSteps({ steps, current }: { steps: Array<{ icon: IconType; label: Text }>; current: number }) {
  const { tx, num, t } = useI18n();
  return (
    <ol className="flex items-center gap-2" aria-label={t(`Step ${current + 1} of ${steps.length}`, `${steps.length} ধাপের ${current + 1} নম্বর ধাপ`)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={i} className={cn('flex items-center gap-2', i < steps.length - 1 && 'flex-1')} aria-current={active ? 'step' : undefined}>
            <span className={cn('flex shrink-0 items-center gap-1.5', active ? 'text-guide-700' : done ? 'text-guide-700' : 'text-ink-soft/70')}>
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-full border-2 font-sign text-lg',
                  active ? 'border-guide-600' : done ? 'border-guide-600' : 'border-line',
                )}
              >
                {done ? <Check className="h-5 w-5" strokeWidth={3} /> : num(i + 1)}
              </span>
              {active && <span className="font-semibold">{tx(s.label)}</span>}
            </span>
            {i < steps.length - 1 && <span className={cn('h-1 flex-1 rounded-full', done ? 'bg-guide-600' : 'bg-line')} />}
          </li>
        );
      })}
    </ol>
  );
}

interface ActionBarProps {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextIcon?: IconType;
  nextVariant?: 'primary' | 'mark' | 'sign' | 'danger';
  error?: string;
  fixed?: boolean;
  aside?: ReactNode;
}

export function ActionBar({ onBack, backLabel, onNext, nextLabel, nextIcon: NextIcon, nextVariant = 'primary', error, fixed = true, aside }: ActionBarProps) {
  const { t } = useI18n();
  const body = (
    <>
      {error && (
        <p role="alert" className="mb-3 rounded-xl bg-stop-50 px-3 py-2.5 font-semibold text-stop-700">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="secondary" size="lg" onClick={onBack}>
            <ChevronLeft />
            {backLabel ?? t('Back', 'পেছনে')}
          </Button>
        )}
        {aside}
        <Button variant={nextVariant} size="xl" onClick={onNext} className="ml-auto min-w-0 flex-1 sm:flex-none">
          {NextIcon && <NextIcon />}
          <span className="truncate">{nextLabel}</span>
        </Button>
      </div>
    </>
  );

  if (!fixed) return <div className="pt-2">{body}</div>;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-white/95 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">{body}</div>
    </div>
  );
}
