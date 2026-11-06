import type { ComplaintCategory, IncidentKey, MaterialKey, PostKey, RaiseReason, Text } from './types';

export const POSTS: Record<PostKey, Text> = {
  foreman: { en: 'Foreman', bn: 'ফোরম্যান' },
  mason: { en: 'Mason', bn: 'রাজমিস্ত্রি' },
  operator: { en: 'Machine operator', bn: 'মেশিন চালক' },
  roller: { en: 'Roller driver', bn: 'রোলার চালক' },
  laborer: { en: 'Laborer', bn: 'শ্রমিক' },
  helper: { en: 'Helper', bn: 'সহকারী' },
};

export interface MaterialDef {
  key: MaterialKey;
  name: Text;
  unit: Text;
  defaultQty: number;
  step: number;
  wasteStep: number;
}

export const MATERIALS: MaterialDef[] = [
  { key: 'bitumen', name: { en: 'Bitumen', bn: 'বিটুমিন' }, unit: { en: 'drum', bn: 'ড্রাম' }, defaultQty: 12, step: 1, wasteStep: 1 },
  { key: 'stone', name: { en: 'Stone chips', bn: 'পাথর কুচি' }, unit: { en: 'cft', bn: 'সিএফটি' }, defaultQty: 800, step: 50, wasteStep: 10 },
  { key: 'sand', name: { en: 'Sand', bn: 'বালু' }, unit: { en: 'cft', bn: 'সিএফটি' }, defaultQty: 500, step: 50, wasteStep: 10 },
  { key: 'cement', name: { en: 'Cement', bn: 'সিমেন্ট' }, unit: { en: 'bag', bn: 'ব্যাগ' }, defaultQty: 60, step: 5, wasteStep: 1 },
  { key: 'diesel', name: { en: 'Diesel', bn: 'ডিজেল' }, unit: { en: 'litre', bn: 'লিটার' }, defaultQty: 150, step: 10, wasteStep: 2 },
];

export const MATERIAL_BY_KEY = Object.fromEntries(MATERIALS.map((m) => [m.key, m])) as Record<MaterialKey, MaterialDef>;

export const INCIDENTS: Record<IncidentKey, Text> = {
  waste: { en: 'Material wasted', bn: 'মাল নষ্ট হয়েছে' },
  mistake: { en: 'Work had to be redone', bn: 'কাজ আবার করতে হয়েছে' },
  injury: { en: 'Someone got hurt', bn: 'কেউ আহত হয়েছেন' },
  machine: { en: 'Machine broke down', bn: 'মেশিন নষ্ট হয়েছে' },
  weather: { en: 'Rain or heat', bn: 'বৃষ্টি বা গরম' },
};
export const INCIDENT_KEYS = Object.keys(INCIDENTS) as IncidentKey[];

export const COMPLAINT_CATEGORIES: Record<ComplaintCategory, Text> = {
  payment: { en: 'Pay problem', bn: 'টাকার সমস্যা' },
  safety: { en: 'Unsafe work', bn: 'বিপজ্জনক কাজ' },
  behaviour: { en: 'Bad behaviour', bn: 'খারাপ ব্যবহার' },
  harassment: { en: 'Harassment', bn: 'হয়রানি' },
  conditions: { en: 'No water, rest or shade', bn: 'পানি, বিশ্রাম বা ছায়া নেই' },
  other: { en: 'Something else', bn: 'অন্য কিছু' },
};
export const COMPLAINT_KEYS = Object.keys(COMPLAINT_CATEGORIES) as ComplaintCategory[];

export const RAISE_REASONS: Record<RaiseReason, Text> = {
  responsibility: { en: 'More responsibility', bn: 'বেশি দায়িত্ব' },
  skill: { en: 'Learned a new skill', bn: 'নতুন কাজ শিখেছি' },
  prices: { en: 'Prices went up', bn: 'জিনিসের দাম বেড়েছে' },
  hazard: { en: 'Dangerous work', bn: 'ঝুঁকির কাজ' },
  family: { en: 'Health or family need', bn: 'স্বাস্থ্য বা পরিবারের প্রয়োজন' },
  other: { en: 'Other reason', bn: 'অন্য কারণ' },
};
export const RAISE_KEYS = Object.keys(RAISE_REASONS) as RaiseReason[];
