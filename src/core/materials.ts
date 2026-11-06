import type { MaterialKey, MaterialLine } from './types';

export function sumMaterials(lists: MaterialLine[][]): MaterialLine[] {
  const by = new Map<MaterialKey, MaterialLine>();
  lists.flat().forEach((m) => {
    const cur = by.get(m.key) ?? { key: m.key, allocated: 0, used: 0, wasted: 0 };
    by.set(m.key, { key: m.key, allocated: cur.allocated + m.allocated, used: cur.used + m.used, wasted: cur.wasted + m.wasted });
  });
  return Array.from(by.values());
}
