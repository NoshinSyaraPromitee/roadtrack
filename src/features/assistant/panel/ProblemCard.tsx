import { CircleAlert, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { PROBLEMS } from '../problems';
import type { ProblemKey } from '../problems';

export function ProblemCard({ k, onRetry, onClose }: { k: ProblemKey; onRetry?: () => void; onClose?: () => void }) {
  const i = useI18n();
  const p = PROBLEMS[k];
  const error = p.tone === 'error';
  const Icon = error ? CircleAlert : TriangleAlert;
  return (
    <div role="alert" className="rounded-2xl bg-white p-3.5 ring-1 ring-line">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className={cn('min-w-0 flex-1 font-semibold leading-snug', error ? 'text-stop-700' : 'text-ink')}>{i.tx(p.title)}</p>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={i.t('Close', 'বন্ধ করুন')} className="-m-1 grid h-8 w-8 shrink-0 place-items-center text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <dl className="mt-2 space-y-1.5 pl-7 text-[0.95rem] leading-snug">
        <div>
          <dt className="font-semibold text-ink-soft">{i.t('Why it happened', 'কেন হলো')}</dt>
          <dd>{i.tx(p.why)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-soft">{i.t('How to fix it', 'কীভাবে ঠিক করবেন')}</dt>
          <dd>{i.tx(p.fix)}</dd>
        </div>
      </dl>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ml-7 mt-2 flex h-10 items-center gap-1.5 rounded-lg font-semibold text-guide-700 hover:bg-guide-50">
          <RotateCcw className="h-4 w-4" />
          {i.t('Try again', 'আবার চেষ্টা করুন')}
        </button>
      )}
    </div>
  );
}
