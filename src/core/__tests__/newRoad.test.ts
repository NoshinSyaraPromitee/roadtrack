import { describe, expect, it } from 'vitest';
import type { RoadDraft } from '../newRoad';
import { roadProblems, toRoad } from '../newRoad';
import { roadById, ROADS } from '../roads';

const draft = (over: Partial<RoadDraft> = {}): RoadDraft => ({
  nameEn: 'Uttara Sector 7 Road',
  nameBn: '',
  areaEn: 'Uttara, Dhaka',
  areaBn: 'উত্তরা, ঢাকা',
  fromEn: 'Jasimuddin Road',
  fromBn: '',
  toEn: 'Rajlakshmi',
  toBn: '',
  lengthKm: 2.5,
  places: '',
  ...over,
});

describe('roadProblems', () => {
  it('accepts a complete draft', () => {
    expect(roadProblems(draft(), ROADS)).toEqual([]);
  });

  it('flags every missing English field and a bad length', () => {
    expect(roadProblems(draft({ nameEn: 'ab', areaEn: ' ', fromEn: '', toEn: '', lengthKm: 0 }), ROADS)).toEqual(['name', 'area', 'from', 'to', 'length']);
    expect(roadProblems(draft({ lengthKm: 201 }), ROADS)).toEqual(['length']);
  });

  it('refuses a name that is already used, ignoring case and spaces', () => {
    expect(roadProblems(draft({ nameEn: '  tongi-gazipur   link road ' }), ROADS)).toEqual(['duplicate']);
  });
});

describe('toRoad', () => {
  it('uses English where Bangla is empty and marks the road as custom', () => {
    const road = toRoad(draft(), 'x1');
    expect(road).toMatchObject({ id: 'x1', custom: true, lengthKm: 2.5 });
    expect(road.name).toEqual({ en: 'Uttara Sector 7 Road', bn: 'Uttara Sector 7 Road' });
    expect(road.area).toEqual({ en: 'Uttara, Dhaka', bn: 'উত্তরা, ঢাকা' });
  });

  it('puts start and end around the listed places without repeats', () => {
    const road = toRoad(draft({ places: 'Sector 7 Park\n\n  House Building \nrajlakshmi' }), 'x2');
    expect(road.places.map((p) => p.en)).toEqual(['Jasimuddin Road', 'Sector 7 Park', 'House Building', 'Rajlakshmi']);
  });

  it('can be found by id in a list that includes it', () => {
    const road = toRoad(draft(), 'x3');
    expect(roadById('x3', [...ROADS, road])).toBe(road);
    expect(roadById('x3')).toBe(ROADS[0]);
  });
});
