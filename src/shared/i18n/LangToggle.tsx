import { Languages } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Lang } from './types';
import { useLang } from './store';

const OPTIONS: Array<{ value: Lang; label: string; short: string }> = [
  { value: 'bn', label: 'বাংলা', short: 'বাংলা' },
  { value: 'en', label: 'English', short: 'EN' },
];

/** Two words, the chosen one in colour. No pill, no background. */
export function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const dark = tone === 'dark';

  return (
    <div role="radiogroup" aria-label="Language / ভাষা" className="inline-flex items-center gap-1">
      <Languages className={cn('hidden h-4 w-4 sm:block', dark ? 'text-white/60' : 'text-ink-soft')} aria-hidden="true" />
      {OPTIONS.map((o, idx) => {
        const on = lang === o.value;
        return (
          <span key={o.value} className="inline-flex items-center gap-1">
            {idx > 0 && <span className={dark ? 'text-white/35' : 'text-line'}>|</span>}
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setLang(o.value)}
              className={cn(
                'px-1.5 py-1.5 transition',
                on ? cn('font-bold', dark ? 'text-mark-400' : 'text-guide-700') : cn('font-semibold', dark ? 'text-white/60 hover:text-white' : 'text-ink-soft hover:text-ink'),
              )}
            >
              <span className="sm:hidden">{o.short}</span>
              <span className="hidden sm:inline">{o.label}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
