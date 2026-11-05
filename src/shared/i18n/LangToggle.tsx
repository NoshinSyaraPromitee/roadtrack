import { Languages } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Lang } from './types';
import { useLang } from './store';

const OPTIONS: Array<{ value: Lang; label: string; short: string }> = [
  { value: 'bn', label: 'বাংলা', short: 'বাংলা' },
  { value: 'en', label: 'English', short: 'EN' },
];

export function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const dark = tone === 'dark';

  return (
    <div
      role="radiogroup"
      aria-label="Language / ভাষা"
      className={cn('inline-flex items-center gap-0.5 rounded-full p-1', dark ? 'bg-white/10' : 'bg-white ring-1 ring-line')}
    >
      <Languages className={cn('mx-1.5 hidden h-4 w-4 sm:block', dark ? 'text-white/70' : 'text-ink-soft')} aria-hidden="true" />
      {OPTIONS.map((o) => {
        const on = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setLang(o.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition',
              on && (dark ? 'bg-white text-guide-700' : 'bg-guide-600 text-white'),
              !on && (dark ? 'text-white/80 hover:text-white' : 'text-ink-soft hover:text-ink'),
            )}
          >
            <span className="sm:hidden">{o.short}</span>
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}