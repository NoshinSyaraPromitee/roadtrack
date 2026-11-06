import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';
import { Pictogram } from './Pictogram';
import type { PictoShape, PictoTone } from './Pictogram';

interface TileProps {
  icon: IconType;
  label: Text;
  sub?: Text;
  tone?: PictoTone;
  shape?: PictoShape;
  selected?: boolean;
  onPress: () => void;
  layout?: 'stack' | 'row';
  size?: 'md' | 'lg';
  className?: string;
}

/** A large choice button: pictogram first, short label second. Reads its label aloud when voice help is on. */
export function Tile({ icon, label, sub, tone, shape, selected, onPress, layout = 'stack', size = 'md', className }: TileProps) {
  const { tx } = useI18n();
  const { hint } = useSay();
  const stack = layout === 'stack';

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        hint(label);
        onPress();
      }}
      className={cn(
        'relative flex rounded-2xl border-2 bg-white transition active:scale-[0.98]',
        stack ? 'flex-col items-center justify-center gap-2.5 px-3 py-4 text-center' : 'items-center gap-3 p-3 pr-10 text-left',
        selected ? 'border-guide-600' : 'border-line hover:border-ink-soft/40',
        className,
      )}
    >
      <Pictogram icon={icon} tone={tone} shape={shape} size={size === 'lg' ? 64 : 52} />
      <span className="min-w-0">
        <span className={cn('block leading-snug', 'font-semibold', selected && 'text-guide-700', size === 'lg' ? 'text-lg' : 'text-base')}>{tx(label)}</span>
        {sub && <span className="mt-0.5 block text-sm text-ink-soft">{tx(sub)}</span>}
      </span>
      {selected && (
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-guide-600 text-white">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
