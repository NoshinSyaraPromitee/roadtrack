import type { Road, Text } from './types';

export interface RoadDraft {
  nameEn: string;
  nameBn: string;
  areaEn: string;
  areaBn: string;
  fromEn: string;
  fromBn: string;
  toEn: string;
  toBn: string;
  lengthKm: number;
  places: string;
  photo?: string;
}

export type RoadProblem = 'name' | 'area' | 'from' | 'to' | 'length' | 'duplicate';

export const MAX_ROAD_KM = 200;

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const both = (en: string, bn: string): Text => ({ en: clean(en), bn: clean(bn) || clean(en) });

export function roadProblems(d: RoadDraft, existing: Road[]): RoadProblem[] {
  const problems: RoadProblem[] = [];
  if (clean(d.nameEn).length < 3) problems.push('name');
  if (!clean(d.areaEn)) problems.push('area');
  if (!clean(d.fromEn)) problems.push('from');
  if (!clean(d.toEn)) problems.push('to');
  if (!(d.lengthKm > 0 && d.lengthKm <= MAX_ROAD_KM)) problems.push('length');
  if (existing.some((r) => r.name.en.toLowerCase() === clean(d.nameEn).toLowerCase())) problems.push('duplicate');
  return problems;
}

export function toRoad(d: RoadDraft, id: string): Road {
  const from = both(d.fromEn, d.fromBn);
  const to = both(d.toEn, d.toBn);
  const seen = new Set([from.en.toLowerCase(), to.en.toLowerCase()]);
  const extra = d.places
    .split('\n')
    .map(clean)
    .filter((p) => p && !seen.has(p.toLowerCase()) && !!seen.add(p.toLowerCase()))
    .map((p) => ({ en: p, bn: p }));
  const places = from.en.toLowerCase() === to.en.toLowerCase() ? [from, ...extra] : [from, ...extra, to];
  return {
    id,
    name: both(d.nameEn, d.nameBn),
    area: both(d.areaEn, d.areaBn),
    from,
    to,
    lengthKm: Math.round(d.lengthKm * 100) / 100,
    places,
    photo: d.photo,
    custom: true,
  };
}
