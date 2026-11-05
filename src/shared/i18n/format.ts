import { useMemo } from 'react';
import type { Lang, Text } from './types';
import { useLang } from './store';

export function makeI18n(lang: Lang) {
  const loc = lang === 'bn' ? 'bn-BD' : 'en-US';
  const dateLoc = lang === 'bn' ? 'bn-BD' : 'en-GB';
  const num = (n: number, digits = 0) => n.toLocaleString(loc, { maximumFractionDigits: digits });
  const two = (n: number) => n.toLocaleString(loc, { minimumIntegerDigits: 2, useGrouping: false });

  return {
    lang,
    t: (en: string, bn: string) => (lang === 'bn' ? bn : en),
    tx: (text: Text) => text[lang],
    num,
    /** English digits, for text read aloud by an English voice. */
    numEn: (n: number, digits = 0) => n.toLocaleString('en-US', { maximumFractionDigits: digits }),
    timeEn: (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    fixed: (n: number, digits = 1) => n.toLocaleString(loc, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    taka: (n: number) => `৳${num(Math.round(n))}`,
    takaWords: (n: number) => (lang === 'bn' ? `${num(Math.round(n))} টাকা` : `${num(Math.round(n))} taka`),
    date: (iso: string) => new Date(iso).toLocaleDateString(dateLoc, { day: 'numeric', month: 'short' }),
    dateLong: (iso: string) => new Date(iso).toLocaleDateString(dateLoc, { weekday: 'long', day: 'numeric', month: 'long' }),
    weekday: (iso: string) => new Date(iso).toLocaleDateString(dateLoc, { weekday: 'short' }),
    day: (iso: string) => new Date(iso).toLocaleDateString(dateLoc, { day: 'numeric' }),
    month: (iso: string) => new Date(iso).toLocaleDateString(dateLoc, { month: 'short' }),
    time: (iso: string) => new Date(iso).toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' }),
    dur: (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000));
      return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map(two).join(':');
    },
  };
}

export type I18n = ReturnType<typeof makeI18n>;

export function useI18n() {
  const lang = useLang((s) => s.lang);
  return useMemo(() => makeI18n(lang), [lang]);
}