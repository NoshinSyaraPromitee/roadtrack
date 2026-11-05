import { BrickWall, ClipboardList, Cog, HandHelping, HardHat, Shovel, Tractor } from 'lucide-react';
import type { Person, PostKey } from '@/core/types';
import type { IconType } from '@/shared/ui';
import { isWorker } from './names';

export const POST_ICON: Record<PostKey, IconType> = {
  foreman: ClipboardList,
  mason: BrickWall,
  operator: Cog,
  roller: Tractor,
  laborer: Shovel,
  helper: HandHelping,
};

export const roleIcon = (p: Person): IconType => (isWorker(p) ? POST_ICON[p.post] : HardHat);