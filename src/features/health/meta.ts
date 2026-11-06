import { Bandage, Thermometer, ThumbsUp } from 'lucide-react';
import type { Health } from '@/core/types';
import type { IconType, PictoTone } from '@/shared/ui';

export const HEALTH_ICON: Record<Health, { icon: IconType; tone: PictoTone; text: string }> = {
  fit: { icon: ThumbsUp, tone: 'guide', text: 'text-guide-700' },
  sick: { icon: Thermometer, tone: 'mark', text: 'text-[#9a5b00]' },
  injured: { icon: Bandage, tone: 'stop', text: 'text-stop-600' },
};
