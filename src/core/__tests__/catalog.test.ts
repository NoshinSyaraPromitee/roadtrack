import { describe, expect, it } from 'vitest';
import type { Text } from '../types';
import { COMPLAINT_CATEGORIES, INCIDENTS, MATERIAL_BY_KEY, MATERIALS, POSTS, RAISE_REASONS } from '../catalog';
import { kmToPct, pctToKm, roadById, ROADS } from '../roads';
import { sumMaterials } from '../materials';
import { material } from './fixtures';

const filled = (t: Text) => t.en.trim().length > 0 && t.bn.trim().length > 0;

describe('catalog', () => {
  it('has English and Bangla for every label', () => {
    const texts = [...Object.values(POSTS), ...Object.values(INCIDENTS), ...Object.values(COMPLAINT_CATEGORIES), ...Object.values(RAISE_REASONS), ...MATERIALS.flatMap((m) => [m.name, m.unit])];
    expect(texts.every(filled)).toBe(true);
  });

  it('indexes every material by key', () => {
    MATERIALS.forEach((m) => expect(MATERIAL_BY_KEY[m.key]).toBe(m));
  });
});

describe('roads', () => {
  it('has unique ids, a length and at least one place', () => {
    expect(new Set(ROADS.map((r) => r.id)).size).toBe(ROADS.length);
    ROADS.forEach((r) => {
      expect(r.lengthKm).toBeGreaterThan(0);
      expect(r.places.length).toBeGreaterThan(0);
    });
  });

  it('falls back to the first road for an unknown id', () => {
    expect(roadById('nope')).toBe(ROADS[0]);
    expect(roadById(null)).toBe(ROADS[0]);
  });

  it('converts between km and percent', () => {
    const road = { ...ROADS[0], lengthKm: 4 };
    expect(kmToPct(1, road)).toBe(25);
    expect(pctToKm(25, road)).toBe(1);
    expect(pctToKm(kmToPct(2.35, road), road)).toBe(2.35);
  });
});

describe('sumMaterials', () => {
  it('adds the same material across shifts', () => {
    const total = sumMaterials([[material()], [material({ allocated: 50, used: 40, wasted: 2 })]]);
    expect(total).toEqual([{ key: 'sand', allocated: 150, used: 120, wasted: 7 }]);
  });

  it('keeps different materials apart and handles no shifts', () => {
    expect(sumMaterials([[material(), material({ key: 'stone' })]]).map((m) => m.key)).toEqual(['sand', 'stone']);
    expect(sumMaterials([])).toEqual([]);
  });
});
