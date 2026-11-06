import { CircleCheck, Cylinder, Pause, Shovel, Tractor, Truck, Wrench, Zap, Construction } from 'lucide-react';
import type { Machine, MachineKind, MachineStatus } from '@/core/types';
import type { Text } from '@/shared/i18n';
import type { IconType } from '@/shared/ui';

export const SERVICE_EVERY_HOURS = 250;
export const LOW_FUEL_PCT = 25;

export const MACHINE_KIND: Record<MachineKind, { icon: IconType; name: Text }> = {
  roller: { icon: Tractor, name: { en: 'Road roller', bn: 'রোড রোলার' } },
  excavator: { icon: Shovel, name: { en: 'Excavator', bn: 'এক্সকাভেটর' } },
  paver: { icon: Construction, name: { en: 'Paver', bn: 'পেভার' } },
  mixer: { icon: Cylinder, name: { en: 'Concrete mixer', bn: 'মিক্সার মেশিন' } },
  truck: { icon: Truck, name: { en: 'Dump truck', bn: 'ডাম্প ট্রাক' } },
  generator: { icon: Zap, name: { en: 'Generator', bn: 'জেনারেটর' } },
};

export const MACHINE_STATUS: Record<MachineStatus, { icon: IconType; label: Text; text: string }> = {
  working: { icon: CircleCheck, label: { en: 'Working', bn: 'চলছে' }, text: 'text-guide-700' },
  idle: { icon: Pause, label: { en: 'Idle', bn: 'বসে আছে' }, text: 'text-[#9a5b00]' },
  repair: { icon: Wrench, label: { en: 'Broken', bn: 'নষ্ট' }, text: 'text-stop-600' },
};

export const machineName = (m: Machine): Text => ({ en: `${MACHINE_KIND[m.kind].name.en} ${m.code}`, bn: `${MACHINE_KIND[m.kind].name.bn} ${m.code}` });
export const fuelLow = (m: Machine) => m.fuelPct < LOW_FUEL_PCT;
export const serviceDue = (m: Machine) => m.hoursSinceService >= SERVICE_EVERY_HOURS;
