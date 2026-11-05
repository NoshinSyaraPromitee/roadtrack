import { Angry, Banknote, CircleCheck, CircleEllipsis, Eye, Hand, HardHat, Send, Sun } from 'lucide-react';
import type { ComplaintCategory, ComplaintStatus, Text } from '@/core/types';
import type { IconType, Tone } from '@/shared/ui';

export const CATEGORY_ICON: Record<ComplaintCategory, IconType> = {
  payment: Banknote,
  safety: HardHat,
  behaviour: Angry,
  harassment: Hand,
  conditions: Sun,
  other: CircleEllipsis,
};

export const STATUS_META: Record<ComplaintStatus, { icon: IconType; tone: Tone; label: Text }> = {
  open: { icon: Send, tone: 'yellow', label: { en: 'Sent', bn: 'পাঠানো হয়েছে' } },
  reviewing: { icon: Eye, tone: 'blue', label: { en: 'Being checked', bn: 'দেখা হচ্ছে' } },
  resolved: { icon: CircleCheck, tone: 'green', label: { en: 'Solved', bn: 'সমাধান হয়েছে' } },
};