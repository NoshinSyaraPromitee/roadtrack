import { CircleCheck, LogOut, Thermometer } from 'lucide-react';
import type { PayFlag } from '@/core/types';
import { PAYROLL_RULES } from '@/core/payroll';
import { useI18n } from '@/shared/i18n';
import { Badge, ElderIcon } from '@/shared/ui';
import { FLAG_META } from './flags';

export function PayFlags({ flags, quiet = false }: { flags: PayFlag[]; quiet?: boolean }) {
  const i = useI18n();
  if (flags.length === 0) {
    return quiet ? null : (
      <Badge tone="green" icon={CircleCheck}>
        {i.t('Full day', 'পুরো দিন')}
      </Badge>
    );
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {flags.map((f) => (
        <Badge key={f} tone={FLAG_META[f].tone} icon={FLAG_META[f].icon}>
          {FLAG_META[f].label(i)}
        </Badge>
      ))}
    </span>
  );
}

/** The three pay rules, shown with the same chips used on every pay line. */
export function PayRules() {
  const i = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3 text-sm">
      <span className="mr-1 font-semibold">{i.t('Pay rules', 'মজুরির নিয়ম')}</span>
      <Badge tone="blue" icon={ElderIcon}>
        {i.t(`Age ${i.num(PAYROLL_RULES.seniorAge)}+`, `বয়স ${i.num(PAYROLL_RULES.seniorAge)}+`)} +{i.num(PAYROLL_RULES.seniorBonusPct)}%
      </Badge>
      <Badge tone="yellow" icon={Thermometer}>
        {i.t('Sick or hurt', 'অসুস্থ বা আহত')} +{i.num(PAYROLL_RULES.healthBonusPct)}%
      </Badge>
      <Badge tone="red" icon={LogOut}>
        {i.t('Left early', 'আগে চলে গেলে')} −{i.num(PAYROLL_RULES.earlyLeaveCutPct)}%
      </Badge>
    </div>
  );
}