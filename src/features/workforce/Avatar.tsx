import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Person } from '@/core/types';
import { ICON_COLOR } from '@/shared/ui';
import type { IconType } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { roleIcon } from './postIcons';

function Glyph({ icon: Icon, size }: { icon: IconType; size: number }) {
  return <Icon strokeWidth={2.2} style={{ width: size, height: size, color: '#ffffff' }} />;
}

const missing = new Set<string>();

const photoOf = (person: Person) => `/workers/${person.id}.jpg`;

export function Avatar({ person, size = 56, selected, dim, className }: { person: Person; size?: number; selected?: boolean; dim?: boolean; className?: string }) {
  const mark = Math.max(18, Math.round(size * 0.36));
  const src = photoOf(person);
  const [broken, setBroken] = useState(() => missing.has(src));

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center rounded-full text-white transition',
        selected ? 'ring-4 ring-guide-600 ring-offset-2' : 'ring-2 ring-white',
        dim && 'opacity-50 grayscale',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: ICON_COLOR }}
    >
      <Glyph icon={roleIcon(person)} size={size * 0.46} />
      {!broken && (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => {
            missing.add(src);
            setBroken(true);
          }}
          className="absolute inset-0 h-full w-full rounded-full object-cover"
        />
      )}
      {selected && (
        <span className="absolute -right-1 -top-1 grid place-items-center rounded-full bg-guide-600 text-white ring-2 ring-white" style={{ width: mark, height: mark }}>
          <Check strokeWidth={3.2} style={{ width: mark * 0.62, height: mark * 0.62 }} />
        </span>
      )}
    </span>
  );
}

export function AvatarStack({ people, max = 6, size = 40 }: { people: Person[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} className={i > 0 ? '-ml-3' : undefined} />
      ))}
      {rest > 0 && (
        <span className="-ml-3 grid place-items-center rounded-full bg-white font-sign text-lg text-ink ring-2 ring-white" style={{ width: size, height: size }}>
          +{rest}
        </span>
      )}
    </span>
  );
}
