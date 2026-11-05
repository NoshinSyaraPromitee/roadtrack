import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export interface TabItem<K extends string> {
  key: K;
  icon: IconType;
  label: Text;
  count?: number;
}

export function TabBar<K extends string>({
  items,
  value,
  onChange,
  variant = 'top',
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  variant?: 'top' | 'bottom';
}) {
  const { tx, num } = useI18n();
  const { hint } = useSay();

  if (variant === 'bottom') {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ key, icon: Icon, label, count }) => {
            const on = key === value;
            return (
              <button
                key={key}
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => {
                  hint(label);
                  onChange(key);
                }}
                className={cn('relative flex flex-col items-center gap-1 pb-2.5 pt-3 transition', on ? 'text-guide-700' : 'text-ink-soft')}
              >
                <span className={cn('absolute inset-x-6 top-0 h-1 rounded-b-full', on ? 'bg-guide-600' : 'bg-transparent')} />
                <span className={cn('relative grid h-11 w-14 place-items-center rounded-2xl', on && 'bg-guide-50')}>
                  <Icon className="h-7 w-7" strokeWidth={on ? 2.4 : 2} />
                  {!!count && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-stop-500 px-1 text-xs font-bold text-white">{num(count)}</span>
                  )}
                </span>
                <span className="text-sm font-semibold">{tx(label)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav>
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-black/[0.04] p-1.5 sm:inline-flex">
        {items.map(({ key, icon: Icon, label, count }) => {
          const on = key === value;
          return (
            <button
              key={key}
              type="button"
              aria-current={on ? 'page' : undefined}
              onClick={() => {
                hint(label);
                onChange(key);
              }}
              className={cn(
                'flex h-11 grow items-center justify-center gap-2 rounded-xl px-3 font-semibold transition sm:grow-0 sm:px-4',
                on ? 'bg-white text-ink shadow-[0_1px_0_0_var(--color-line)] ring-1 ring-line' : 'text-ink-soft hover:text-ink',
              )}
            >
              <Icon className={cn('h-5 w-5', on && 'text-guide-600')} />
              {tx(label)}
              {!!count && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-stop-500 px-1.5 text-xs font-bold text-white">{num(count)}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}