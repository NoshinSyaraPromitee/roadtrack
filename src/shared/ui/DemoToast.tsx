import { useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';

/** A small pop-up in a bottom corner for "demo only" notes. On phones it spans the bottom edge. */
export function DemoToast({ icon: Icon, side = 'right', children }: { icon: IconType; side?: 'left' | 'right'; children: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div role="status" aria-live="polite" className={cn('fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:bottom-6 sm:w-80', side === 'left' ? 'sm:left-6' : 'sm:right-6')}>
      <div className="flex items-start gap-3 rounded-2xl border border-sign-100 bg-white p-4 shadow-[0_12px_32px_-12px_rgba(23,32,27,0.35)]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sign-50 text-sign-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-sm leading-snug text-ink-soft">{children}</div>
        <button type="button" onClick={() => setOpen(false)} aria-label={t('Close', 'বন্ধ করুন')} className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
