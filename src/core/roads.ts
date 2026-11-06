import type { Road } from './types';

/** Demo roads. Places are names a crew would say out loud, not chainage or coordinates. */
export const ROADS: Road[] = [
  {
    id: 'r1',
    name: { en: 'Tongi–Gazipur Link Road', bn: 'টঙ্গী–গাজীপুর সংযোগ সড়ক' },
    area: { en: 'Gazipur', bn: 'গাজীপুর' },
    from: { en: 'Cherag Ali Market', bn: 'চেরাগ আলী মার্কেট' },
    to: { en: 'Board Bazar', bn: 'বোর্ড বাজার' },
    lengthKm: 4.2,
    places: [
      { en: 'Cherag Ali Market', bn: 'চেরাগ আলী মার্কেট' },
      { en: 'Station Road Gate', bn: 'স্টেশন রোড গেট' },
      { en: 'Gazipura Bus Stand', bn: 'গাজীপুরা বাসস্ট্যান্ড' },
      { en: 'Board Bazar', bn: 'বোর্ড বাজার' },
    ],
  },
  {
    id: 'r2',
    name: { en: 'Mirpur 10 – Kalshi Road', bn: 'মিরপুর ১০ – কালশী সড়ক' },
    area: { en: 'Mirpur, Dhaka', bn: 'মিরপুর, ঢাকা' },
    from: { en: 'Mirpur 10 Circle', bn: 'মিরপুর ১০ গোলচত্বর' },
    to: { en: 'Kalshi Flyover', bn: 'কালশী ফ্লাইওভার' },
    lengthKm: 3,
    places: [
      { en: 'Mirpur 10 Circle', bn: 'মিরপুর ১০ গোলচত্বর' },
      { en: 'Mirpur 11 Bus Stand', bn: 'মিরপুর ১১ বাসস্ট্যান্ড' },
      { en: 'Purabi Cinema Hall', bn: 'পূরবী সিনেমা হল' },
      { en: 'Kalshi Flyover', bn: 'কালশী ফ্লাইওভার' },
    ],
  },
  {
    id: 'r3',
    name: { en: 'Savar – Baipail Road', bn: 'সাভার – বাইপাইল সড়ক' },
    area: { en: 'Savar, Dhaka', bn: 'সাভার, ঢাকা' },
    from: { en: 'Savar Bus Stand', bn: 'সাভার বাসস্ট্যান্ড' },
    to: { en: 'Baipail Junction', bn: 'বাইপাইল মোড়' },
    lengthKm: 6.5,
    places: [
      { en: 'Savar Bus Stand', bn: 'সাভার বাসস্ট্যান্ড' },
      { en: 'Radio Colony', bn: 'রেডিও কলোনি' },
      { en: 'Nabinagar', bn: 'নবীনগর' },
      { en: 'Baipail Junction', bn: 'বাইপাইল মোড়' },
    ],
  },
  {
    id: 'r4',
    name: { en: 'Medical More – Modern More Road', bn: 'মেডিকেল মোড় – মডার্ন মোড় সড়ক' },
    area: { en: 'Rangpur', bn: 'রংপুর' },
    from: { en: 'Medical More', bn: 'মেডিকেল মোড়' },
    to: { en: 'Modern More', bn: 'মডার্ন মোড়' },
    lengthKm: 2.8,
    places: [
      { en: 'Medical More', bn: 'মেডিকেল মোড়' },
      { en: 'Dhap Lalkuthi', bn: 'ধাপ লালকুঠি' },
      { en: 'Jahaj Company More', bn: 'জাহাজ কোম্পানি মোড়' },
      { en: 'Modern More', bn: 'মডার্ন মোড়' },
    ],
  },
];

export const ROAD_BY_ID: Record<string, Road> = Object.fromEntries(ROADS.map((r) => [r.id, r]));

export const roadById = (id: string | null | undefined): Road => ROAD_BY_ID[id ?? ''] ?? ROADS[0];

/** Kilometres done to percent of the whole road, kept to two decimals. */
export const kmToPct = (km: number, road: Road) => Math.round((km / road.lengthKm) * 10000) / 100;
export const pctToKm = (pct: number, road: Road) => Math.round(((pct * road.lengthKm) / 100) * 100) / 100;
