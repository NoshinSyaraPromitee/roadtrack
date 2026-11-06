import { cn } from '@/shared/lib/utils';
import type { Lang } from './types';
import { useLang } from './store';

const OPTIONS: Array<{ value: Lang; label: string }> = [
  { value: 'bn', label: 'বাংলা' },
  { value: 'en', label: 'English' },
];

export function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const dark = tone === 'dark';

  return (
    <div
      role="radiogroup"
      aria-label="Language / ভাষা"
      className={cn('inline-flex items-center gap-0.5 rounded-full p-0.5 ring-1', dark ? 'ring-white/35' : 'bg-white ring-line')}
    >
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
              'h-8 rounded-full px-2.5 text-sm font-semibold transition sm:px-3',
              on
                ? dark
                  ? 'bg-white text-guide-700'
                  : 'bg-guide-600 text-white'
                : dark
                  ? 'text-white/85 hover:bg-white/15 hover:text-white'
                  : 'text-ink-soft hover:bg-guide-50 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
