import { CircleCheck, Construction, Cylinder, Pause, Shovel, Tractor, Truck, Wrench, Zap } from 'lucide-react';
import type { MachineKind, MachineStatus } from '@/core/types';
import type { Text } from '@/shared/i18n';
import type { IconType } from '@/shared/ui';

export const MACHINE_ICON: Record<MachineKind, IconType> = {
  roller: Tractor,
  excavator: Shovel,
  paver: Construction,
  mixer: Cylinder,
  truck: Truck,
  generator: Zap,
};

export const MACHINE_STATUS: Record<MachineStatus, { icon: IconType; label: Text; text: string }> = {
  working: { icon: CircleCheck, label: { en: 'Working', bn: 'চলছে' }, text: 'text-guide-700' },
  idle: { icon: Pause, label: { en: 'Idle', bn: 'বসে আছে' }, text: 'text-[#9a5b00]' },
  repair: { icon: Wrench, label: { en: 'Broken', bn: 'নষ্ট' }, text: 'text-stop-600' },
};
