import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

const LOGO = '/logo.jpg';

function DrawnMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="9" fill="#09400e" />
      <rect x="4" y="4" width="32" height="32" rx="6.5" fill="none" stroke="#ffffff" strokeWidth="1.8" />
      <path d="M16.5 9 L11 31 H29 L23.5 9 Z" fill="#ffffff" />
      <path d="M20 12 V15.5 M20 18.5 V22.5 M20 25.5 V30" stroke="#09400e" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const light = tone === 'light';
  const [broken, setBroken] = useState(false);
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {broken ? (
        <DrawnMark />
      ) : (
        <img src={LOGO} alt="" onError={() => setBroken(true)} className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain" />
      )}
      <span className={cn('font-sign text-2xl leading-none', light ? 'text-white' : 'text-ink')}>
        Road<span className="text-[#c89509]">Track</span>
      </span>
    </span>
  );
}
