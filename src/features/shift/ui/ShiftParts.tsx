import type { ReactNode } from 'react';
import { CircleCheck } from 'lucide-react';
import type { IncidentKey, MaterialLine } from '@/core/types';
import { INCIDENTS, MATERIAL_BY_KEY } from '@/core/catalog';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Badge, StackBar, Stepper } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { INCIDENT_ICON, MaterialPicto } from './icons';

export function MaterialUseList({ lines, compact = false }: { lines: MaterialLine[]; compact?: boolean }) {
  const { tx, num } = useI18n();
  return (
    <ul className={compact ? 'space-y-2.5' : 'space-y-3'}>
      {lines.map((m) => {
        const def = MATERIAL_BY_KEY[m.key];
        return (
          <li key={m.key} className={cn('flex items-center', compact ? 'gap-2.5' : 'gap-3')}>
            <MaterialPicto k={m.key} size={compact ? 30 : 36} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-sm">
                <span className={compact ? undefined : 'font-semibold'}>{tx(def.name)}</span>
                <span className="tabular-nums text-ink-soft">
                  {num(m.used)} <span className="text-stop-600">+{num(m.wasted)}</span> / {num(m.allocated)}
                  {!compact && ` ${tx(def.unit)}`}
                </span>
              </div>
              <StackBar
                className={compact ? 'mt-1 h-2' : 'mt-1.5'}
                total={m.allocated}
                parts={[
                  { value: m.used, className: 'bg-guide-500' },
                  { value: m.wasted, className: 'bg-stop-500' },
                ]}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function IncidentBadges({ tags, none }: { tags: IncidentKey[]; none: Text }) {
  const { tx } = useI18n();
  if (tags.length === 0) {
    return (
      <Badge tone="green" icon={CircleCheck}>
        {tx(none)}
      </Badge>
    );
  }
  return (
    <>
      {tags.map((k) => (
        <Badge key={k} tone="red" icon={INCIDENT_ICON[k]}>
          {tx(INCIDENTS[k])}
        </Badge>
      ))}
    </>
  );
}

export function KmStepper({ km, min, max, progress, onChange, children }: { km: number; min: number; max: number; progress: number; onChange: (km: number) => void; children?: ReactNode }) {
  const { t, fixed } = useI18n();
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4">
      <div className="w-full max-w-xs">
        <Stepper value={km} step={0.05} decimals={2} min={min} max={max} unit={t('km', 'কিমি')} size="lg" label={t('Road done in km', 'কত কিমি হয়েছে')} onChange={onChange} />
      </div>
      <p className="font-sign text-3xl text-guide-700">= {fixed(progress)}%</p>
      {children}
    </div>
  );
}
