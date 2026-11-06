import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { ProblemCard } from './ProblemCard';

export function WakeRow({ wakeOn, setWake, blocked }: { wakeOn: boolean; setWake: (on: boolean) => void; blocked: boolean }) {
  const i = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-1">
      <span className="min-w-0 flex-1 font-semibold">{i.t('Call me by saying "Apa"', '"আপা" বলে ডাকুন')}</span>
      <span role="radiogroup" aria-label={i.t('Call by voice', 'কণ্ঠে ডাকা')} className="inline-flex items-center gap-1">
        {[
          { on: true, label: i.t('On', 'চালু') },
          { on: false, label: i.t('Off', 'বন্ধ') },
        ].map((o, idx) => (
          <span key={o.label} className="inline-flex items-center gap-1">
            {idx > 0 && <span className="text-line">|</span>}
            <button
              type="button"
              role="radio"
              aria-checked={wakeOn === o.on}
              onClick={() => setWake(o.on)}
              className={cn('px-1.5 py-1 font-semibold', wakeOn === o.on ? (o.on ? 'text-guide-700' : 'text-stop-600') : 'text-ink-soft/70 hover:text-ink')}
            >
              {o.label}
            </button>
          </span>
        ))}
      </span>
      {wakeOn && blocked && (
        <div className="w-full pt-1">
          <ProblemCard k="mic-blocked" />
        </div>
      )}
    </div>
  );
}
