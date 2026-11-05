import { Bandage, Barrel, CloudSunRain, Fuel, Hourglass, Mountain, Package, Trash2, Undo2, Wrench } from 'lucide-react';
import type { IncidentKey, MaterialKey } from '@/core/types';
import { Pictogram } from '@/shared/ui';
import type { IconType } from '@/shared/ui';

export const MATERIAL_ICON: Record<MaterialKey, IconType> = {
  bitumen: Barrel,
  stone: Mountain,
  sand: Hourglass,
  cement: Package,
  diesel: Fuel,
};

export const INCIDENT_ICON: Record<IncidentKey, IconType> = {
  waste: Trash2,
  mistake: Undo2,
  injury: Bandage,
  machine: Wrench,
  weather: CloudSunRain,
};

export function MaterialPicto({ k, size = 48 }: { k: MaterialKey; size?: number }) {
  return <Pictogram icon={MATERIAL_ICON[k]} tone="plain" size={size} />;
}