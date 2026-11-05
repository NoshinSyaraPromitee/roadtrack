import { useMemo } from 'react';
import { useLang } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { speak } from './speech';
import { useVoiceGuide } from './store';

export function useSay() {
  const lang = useLang((s) => s.lang);
  const on = useVoiceGuide((s) => s.on);
  return useMemo(
    () => ({
      say: (text: Text) => speak(text, lang),
      hint: (text: Text) => {
        if (on) speak(text, lang);
      },
    }),
    [lang, on],
  );
}