import { CircleCheck, CircleEllipsis, CircleX, Flame, HeartPulse, Hourglass, ShoppingBasket, Users, Wrench } from 'lucide-react';
import type { RaiseReason, RaiseStatus, Text } from '@/core/types';
import type { IconType, Tone } from '@/shared/ui';

export const REASON_ICON: Record<RaiseReason, IconType> = {
  responsibility: Users,
  skill: Wrench,
  prices: ShoppingBasket,
  hazard: Flame,
  family: HeartPulse,
  other: CircleEllipsis,
};

export const RAISE_STATUS: Record<RaiseStatus, { icon: IconType; tone: Tone; label: Text }> = {
  pending: { icon: Hourglass, tone: 'yellow', label: { en: 'Waiting', bn: 'অপেক্ষায়' } },
  approved: { icon: CircleCheck, tone: 'green', label: { en: 'Approved', bn: 'অনুমোদিত' } },
  rejected: { icon: CircleX, tone: 'red', label: { en: 'Not approved', bn: 'অনুমোদন হয়নি' } },
};