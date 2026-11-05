import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

export type PictoTone = 'guide' | 'sign' | 'stop' | 'mark' | 'plain' | 'muted';
export type PictoShape = 'plate' | 'disc' | 'warn';

const PALETTE: Record<PictoTone, { fill: string; edge: string; icon: string }> = {
  guide: { fill: '#0a6b4a', edge: '#ffffff', icon: '#ffffff' },
  sign: { fill: '#1c5fb0', edge: '#ffffff', icon: '#ffffff' },
  stop: { fill: '#ffffff', edge: '#d3263a', icon: '#1f2623' },
  mark: { fill: '#ffc930', edge: '#1f2623', icon: '#1f2623' },
  plain: { fill: '#ffffff', edge: '#1f2623', icon: '#1f2623' },
  muted: { fill: '#e1e5e0', edge: '#e1e5e0', icon: '#7a847e' },
};

/**
 * A pictogram drawn like a road sign: a guide plate, a round "do this" disc or a warning triangle.
 * Meaning is carried by shape and colour so the label is optional.
 */
export function Pictogram({
  icon: Icon,
  tone = 'guide',
  shape = 'plate',
  size = 48,
  label,
  className,
}: {
  icon: IconType;
  tone?: PictoTone;
  shape?: PictoShape;
  size?: number;
  label?: string;
  className?: string;
}) {
  const p = PALETTE[tone];
  const warn = shape === 'warn';
  const iconSize = Math.round(size * (warn ? 0.42 : 0.5));
  const ringed = tone === 'stop' || tone === 'plain' || tone === 'mark';

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {shape === 'plate' && (
          <>
            <rect x="2" y="2" width="96" height="96" rx="22" fill={ringed ? p.edge : p.fill} />
            <rect x="9" y="9" width="82" height="82" rx="15" fill={ringed ? p.fill : 'none'} stroke={ringed ? 'none' : p.edge} strokeWidth="4" />
          </>
        )}
        {shape === 'disc' && (
          <>
            <circle cx="50" cy="50" r="48" fill={ringed ? p.edge : p.fill} />
            <circle cx="50" cy="50" r={ringed ? 38 : 40} fill={ringed ? p.fill : 'none'} stroke={ringed ? 'none' : p.edge} strokeWidth="4" />
          </>
        )}
        {warn && (
          <path
            d="M50 9 L93 85 H7 Z"
            fill={tone === 'mark' ? '#ffc930' : '#ffffff'}
            stroke={tone === 'mark' ? '#1f2623' : tone === 'sign' ? '#1c5fb0' : '#d3263a'}
            strokeWidth="11"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <Icon
        className="relative"
        strokeWidth={2.4}
        style={{ width: iconSize, height: iconSize, color: warn ? '#1f2623' : p.icon, transform: warn ? `translateY(${size * 0.11}px)` : undefined }}
      />
    </span>
  );
}