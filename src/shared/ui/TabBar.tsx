import type { CSSProperties } from 'react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export interface TabItem<K extends string> {
  key: K;
  icon?: IconType;
  label: Text;
  count?: number;
}

function Count({ n, className }: { n: string; className?: string }) {
  return <span className={cn('grid h-5 min-w-5 place-items-center rounded-full bg-stop-500 px-1.5 text-xs font-bold text-white', className)}>{n}</span>;
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
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-white/95 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)] backdrop-blur">
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
                {Icon ? (
                  <span className="relative grid h-11 w-14 place-items-center">
                    <Icon className="h-7 w-7" strokeWidth={on ? 2.4 : 2} />
                    {!!count && <Count n={num(count)} className="absolute -right-1 -top-1" />}
                  </span>
                ) : (
                  <span className={cn('absolute inset-x-4 top-0 h-1 rounded-b-full transition', on ? 'bg-guide-600' : 'bg-transparent')} />
                )}
                <span className={cn('flex items-center gap-1.5 font-semibold', Icon ? 'text-sm' : 'py-2 text-base')}>
                  {tx(label)}
                  {!Icon && !!count && <Count n={num(count)} />}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav>
      <div
        className="grid grid-cols-[repeat(var(--cols-sm),minmax(0,1fr))] gap-x-2 lg:max-w-[calc(var(--cols)*12rem)] lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ '--cols': items.length, '--cols-sm': Math.min(items.length, 3) } as CSSProperties}
      >
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
                'flex min-h-14 items-center justify-center gap-2 px-1 py-1.5 text-center font-semibold leading-tight transition',
                on ? 'text-guide-700' : 'text-ink-soft hover:text-ink',
                !Icon && (on ? 'border-b-2 border-guide-600' : 'border-b-2 border-transparent'),
              )}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {tx(label)}
              {!!count && <Count n={num(count)} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
