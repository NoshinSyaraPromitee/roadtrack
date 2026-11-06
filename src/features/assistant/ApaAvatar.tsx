import { useEffect } from 'react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { APA_PHOTO, useApaPhoto } from './photo';

export type ApaMood = 'idle' | 'listening' | 'talking';

const RING: Record<ApaMood, string> = {
  idle: 'ring-white',
  talking: 'ring-mark-400',
  listening: 'ring-stop-500',
};

export function ApaAvatar({ size = 52, mood = 'idle', className }: { size?: number; mood?: ApaMood; className?: string }) {
  const i = useI18n();
  const status = useApaPhoto((s) => s.status);
  const load = useApaPhoto((s) => s.load);

  useEffect(() => {
    if (status === 'idle') load();
  }, [status, load]);

  return (
    <span
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full bg-paper ring-[3px] transition-[box-shadow]', RING[mood], className)}
      style={{ width: size, height: size }}
    >
      {status === 'ready' && <img src={APA_PHOTO} alt={i.t('Apa, your helper', 'আপা, আপনার সহকারী')} draggable={false} className="h-full w-full object-cover object-top" />}
      {(status === 'idle' || status === 'loading') && (
        <span role="status" aria-label={i.t('Loading Apa’s picture', 'আপার ছবি আসছে')} className="absolute inset-0 animate-pulse bg-line" />
      )}
      {status === 'error' && (
        <span className="grid h-full w-full place-items-center bg-sign-500 font-sign leading-none text-white" style={{ fontSize: Math.max(12, size * 0.32) }}>
          {i.t('Apa', 'আপা')}
        </span>
      )}
    </span>
  );
}
