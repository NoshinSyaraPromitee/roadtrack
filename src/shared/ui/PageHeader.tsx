import type { ReactNode } from 'react';
import type { Text } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';

export function PageHeader({ title, subtitle, speak, action }: { title: string; subtitle?: string; speak?: Text; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h1 className="font-sign text-3xl leading-[1.05] sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-ink-soft sm:text-lg">{subtitle}</p>}
        </div>
        {speak && <SpeakButton text={speak} className="mt-0.5" />}
      </div>
      {action}
    </div>
  );
}