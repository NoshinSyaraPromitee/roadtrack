import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './types';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'roadtrack-v3-lang' },
  ),
);
