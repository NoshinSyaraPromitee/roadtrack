import { Check } from 'lucide-react';
import type { Person } from '@/core/types';
import { Pictogram } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { Face } from './Face';
import { roleIcon } from './postIcons';

export function Avatar({ person, size = 56, selected, dim, badge = true }: { person: Person; size?: number; selected?: boolean; dim?: boolean; badge?: boolean }) {
  const mark = Math.max(18, Math.round(size * 0.36));
  return (
    <span className={cn('relative inline-block shrink-0 transition', dim && 'opacity-50 grayscale')} style={{ width: size, height: size }}>
      <span className={cn('block overflow-hidden rounded-full', selected ? 'ring-4 ring-guide-600 ring-offset-2' : 'ring-2 ring-white')}>
        <Face look={person.look} size={size} className="block" />
      </span>
      {badge && (
        <span className="absolute -bottom-0.5 -right-1 leading-none">
          <Pictogram icon={roleIcon(person)} size={mark} />
        </span>
      )}
      {selected && (
        <span className="absolute -right-1 -top-1 grid place-items-center rounded-full bg-guide-600 text-white ring-2 ring-white" style={{ width: mark, height: mark }}>
          <Check strokeWidth={3.2} style={{ width: mark * 0.62, height: mark * 0.62 }} />
        </span>
      )}
    </span>
  );
}

export function FaceStack({ people, max = 6, size = 40 }: { people: Person[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((p, i) => (
        <span key={p.id} className={cn('rounded-full ring-2 ring-white', i > 0 && '-ml-3')}>
          <Face look={p.look} size={size} className="block rounded-full" />
        </span>
      ))}
      {rest > 0 && (
        <span className="-ml-3 grid place-items-center rounded-full bg-white font-sign text-ink ring-2 ring-white" style={{ width: size, height: size }}>
          +{rest}
        </span>
      )}
    </span>
  );
}