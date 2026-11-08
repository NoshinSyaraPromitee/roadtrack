import type { ReactNode } from 'react';
import type { Text } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { cn } from '@/shared/lib/utils';
import type { IconType } from './icons';
import { Pictogram } from './Pictogram';
import type { PictoShape, PictoTone } from './Pictogram';

export function Card({ className, tone = 'plain', children }: { className?: string; tone?: 'plain' | 'alert' | 'sunk'; children: ReactNode }) {
  return (
    <section
      className={cn(
        'rounded-[14px] p-5 sm:p-6',
        tone === 'plain' && 'border border-line bg-white',
        tone === 'alert' && 'border-2 border-mark-400 bg-mark-100',
        tone === 'sunk' && 'bg-black/[0.035]',
        className,
      )}
    >
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  tone?: PictoTone;
  shape?: PictoShape;
  speak?: Text;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, tone, shape, speak, action }: CardHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <Pictogram icon={icon} tone={tone} shape={shape} size={40} />}
        <div className="min-w-0">
          <h2 className="font-sign text-[1.6rem] leading-[1.1] sm:text-[1.85rem]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft sm:text-base">{subtitle}</p>}
        </div>
        {speak && <SpeakButton text={speak} size="sm" />}
      </div>
      {action}
    </div>
  );
}
