import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export type PictoTone = 'guide' | 'sign' | 'stop' | 'mark' | 'plain' | 'muted';
export type PictoShape = 'plate' | 'disc' | 'warn';

const PALETTE: Record<PictoTone, { fill: string; edge: string; icon: string }> = {
  guide: { fill: '#09400e', edge: '#ffffff', icon: '#ffffff' },
  sign: { fill: '#1c5fb0', edge: '#ffffff', icon: '#ffffff' },
  stop: { fill: '#ffffff', edge: '#d3263a', icon: '#1f2623' },
  mark: { fill: '#ffc930', edge: '#1f2623', icon: '#1f2623' },
  plain: { fill: '#ffffff', edge: '#1f2623', icon: '#1f2623' },
  muted: { fill: '#e1e5e0', edge: '#e1e5e0', icon: '#7a847e' },
};

export const ICON_COLOR = '#09400e';

/** Signs are drawn a little smaller than the space they are given, so screens feel lighter. */
const SCALE = 0.85;

export function Pictogram({
  icon: Icon,
  tone = 'guide',
  shape = 'plate',
  size = 48,
  label,
  className,
  keepTone = false,
  onDark = false,
  fullSize = false,
}: {
  icon: IconType;
  tone?: PictoTone;
  shape?: PictoShape;
  size?: number;
  label?: string;
  className?: string;
  keepTone?: boolean;
  onDark?: boolean;
  /** Draw at the exact size given, for the big role signs on the home page. */
  fullSize?: boolean;
}) {
  const px = fullSize ? size : Math.round(size * SCALE);
  const p = keepTone
    ? PALETTE[tone]
    : onDark
      ? { fill: 'none', edge: '#ffffff', icon: '#ffffff' }
      : { fill: ICON_COLOR, edge: ICON_COLOR, icon: '#ffffff' };
  const toneKey: PictoTone = keepTone ? tone : onDark ? 'plain' : 'guide';
  const warn = shape === 'warn';
  const iconSize = Math.round(px * (warn ? 0.42 : 0.5));
  const ringed = onDark || toneKey === 'stop' || toneKey === 'plain' || toneKey === 'mark';

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: px, height: px }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {shape === 'plate' && <rect x="4" y="4" width="92" height="92" rx="22" fill={p.fill} stroke={ringed ? p.edge : 'none'} strokeWidth={ringed ? 7 : 0} />}
        {shape === 'disc' && <circle cx="50" cy="50" r={ringed ? 45 : 48} fill={p.fill} stroke={ringed ? p.edge : 'none'} strokeWidth={ringed ? 7 : 0} />}
        {warn && (
          <path
            d="M50 9 L93 85 H7 Z"
            fill={!keepTone ? (onDark ? 'none' : '#ffffff') : tone === 'mark' ? '#ffc930' : '#ffffff'}
            stroke={!keepTone ? (onDark ? '#ffffff' : ICON_COLOR) : tone === 'mark' ? '#1f2623' : tone === 'sign' ? '#1c5fb0' : '#d3263a'}
            strokeWidth="11"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <Icon
        className="relative"
        strokeWidth={2.4}
        style={{ width: iconSize, height: iconSize, color: warn ? (keepTone ? '#1f2623' : onDark ? '#ffffff' : ICON_COLOR) : p.icon, transform: warn ? `translateY(${px * 0.11}px)` : undefined }}
      />
    </span>
  );
}
