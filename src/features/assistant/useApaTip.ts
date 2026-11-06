import { useEffect, useRef, useState } from 'react';
import type { Role } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import { speak, useVoiceGuide } from '@/shared/voice';
import { useNow } from '@/shared/lib/useNow';
import { nextStep } from './brain';
import type { ApaContext } from './brain';

export function useApaTip(context: () => ApaContext, role: Role | null, open: boolean) {
  const i = useI18n();
  const voiceGuide = useVoiceGuide((s) => s.on);
  const now = useNow(15_000);
  const [hiddenTip, setHiddenTip] = useState<string | null>(null);
  const spokenTip = useRef<string | null>(null);

  let tip: ReturnType<typeof nextStep> | null = null;
  try {
    tip = role ? nextStep({ ...context(), now }) : null;
  } catch {
    tip = null;
  }
  const showTip = !open && !!tip && hiddenTip !== tip.key;

  useEffect(() => {
    if (!showTip || !tip || !voiceGuide || spokenTip.current === tip.key) return;
    spokenTip.current = tip.key;
    speak(tip.text, i.lang);
  }, [showTip, tip, voiceGuide, i.lang]);

  return { tip, showTip, setHiddenTip };
}
