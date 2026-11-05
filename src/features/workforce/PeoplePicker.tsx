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

/** Pick people by tapping them. The name is read aloud when voice help is on. */
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
              'flex flex-col items-center gap-2 rounded-2xl border-2 px-1 pb-3 pt-4 text-center transition active:scale-[0.97]',
              on ? 'border-guide-600 bg-guide-50' : 'border-transparent bg-white hover:border-line',
            )}
          >
            <Avatar person={p} size={size} selected={on} />
            <span className="w-full px-1">
              <span className="line-clamp-2 font-semibold leading-tight">{personName(p, lang)}</span>
              <span className="block truncate text-sm text-ink-soft">{tx(roleOf(p))}</span>
            </span>
          </button>
        );
      })}
      {children}
    </div>
  );
}