import type { ReactNode } from 'react';
import type { Person } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import { Avatar } from './Avatar';
import { personName, roleOf, spokenName } from './names';

interface PeoplePickerProps {
  people: Person[];
  selected: string[];
  onPick: (id: string) => void;
  size?: number;
  className?: string;
  children?: ReactNode;
}

export function PeoplePicker({ people, selected, onPick, size = 76, className, children }: PeoplePickerProps) {
  const { lang, tx } = useI18n();
  const { hint } = useSay();

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6', className)}>
      {people.map((p) => {
        const on = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => {
              hint(spokenName(p));
              onPick(p.id);
            }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border-2 px-1 pb-3 pt-4 text-center transition',
              on ? 'border-guide-600 bg-white hover:bg-guide-50' : 'border-transparent bg-white hover:border-guide-600 hover:bg-guide-50',
            )}
          >
            <Avatar person={p} size={size} selected={on} />
            <span className="w-full px-1">
              <span className={cn('line-clamp-2 leading-tight', 'font-semibold', on && 'text-guide-700')}>{personName(p, lang)}</span>
              <span className="block truncate text-sm text-ink-soft">{tx(roleOf(p))}</span>
            </span>
          </button>
        );
      })}
      {children}
    </div>
  );
}
