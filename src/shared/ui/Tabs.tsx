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
                className={cn('relative flex flex-col items-center gap-1 pb-2.5 pt-3 transition', on ? 'text-guide-700' : 'text-ink-soft/75')}
              >
                <span className="relative grid h-11 w-14 place-items-center">
                  <Icon className="h-7 w-7" strokeWidth={on ? 2.4 : 2} />
                  {!!count && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-stop-500 px-1 text-xs font-bold text-white">{num(count)}</span>
                  )}
                </span>
                <span className={cn('text-sm', on ? 'font-bold' : 'font-semibold')}>{tx(label)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-line">
      <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-6">
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
                '-mb-px flex h-12 items-center justify-center gap-2 border-b-[3px] px-1 transition',
                on ? 'border-guide-600 font-bold text-guide-700' : 'border-transparent font-semibold text-ink-soft hover:text-ink',
              )}
            >
              <Icon className="h-5 w-5" />
              {tx(label)}
              {!!count && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-stop-500 px-1.5 text-xs font-bold text-white">{num(count)}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
