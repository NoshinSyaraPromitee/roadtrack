import { useMemo } from 'react';
import { useLang } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { speakAuto } from './autoSpeak';

export function useSay() {
  const lang = useLang((s) => s.lang);
  return useMemo(
    () => ({
      say: (text: Text) => speakAuto(text, lang),
      hint: (text: Text) => speakAuto(text, lang),
    }),
    [lang],
  );
}
