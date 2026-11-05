import { Bandage, Ban, LogOut, Thermometer } from 'lucide-react';
import type { PayFlag } from '@/core/types';
import { PAYROLL_RULES } from '@/core/payroll';
import type { I18n } from '@/shared/i18n';
import { ElderIcon } from '@/shared/ui';
import type { IconType, Tone } from '@/shared/ui';

export const FLAG_META: Record<PayFlag, { icon: IconType; tone: Tone; label: (i: I18n) => string }> = {
  absent: { icon: Ban, tone: 'red', label: (i) => i.t('Absent', 'অনুপস্থিত') },
  left: { icon: LogOut, tone: 'red', label: (i) => `${i.t('Left early', 'আগে চলে গেছেন')} −${i.num(PAYROLL_RULES.earlyLeaveCutPct)}%` },
  senior: { icon: ElderIcon, tone: 'blue', label: (i) => `${i.t('Elder', 'বয়স্ক')} +${i.num(PAYROLL_RULES.seniorBonusPct)}%` },
  sick: { icon: Thermometer, tone: 'yellow', label: (i) => `${i.t('Sick', 'অসুস্থ')} +${i.num(PAYROLL_RULES.healthBonusPct)}%` },
  injured: { icon: Bandage, tone: 'yellow', label: (i) => `${i.t('Hurt', 'আহত')} +${i.num(PAYROLL_RULES.healthBonusPct)}%` },
};