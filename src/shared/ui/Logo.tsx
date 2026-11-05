import { cn } from '@/shared/lib/utils';

export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const light = tone === 'light';
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" rx="9" fill={light ? '#ffffff' : '#0a6b4a'} />
        <rect x="4" y="4" width="32" height="32" rx="6.5" fill="none" stroke={light ? '#0a6b4a' : '#ffffff'} strokeWidth="1.8" />
        <path d="M16.5 9 L11 31 H29 L23.5 9 Z" fill={light ? '#0a6b4a' : '#ffffff'} />
        <path d="M20 12 V15.5 M20 18.5 V22.5 M20 25.5 V30" stroke={light ? '#ffffff' : '#0a6b4a'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className={cn('font-sign text-2xl leading-none', light ? 'text-white' : 'text-ink')}>RoadTrack</span>
    </span>
  );
}