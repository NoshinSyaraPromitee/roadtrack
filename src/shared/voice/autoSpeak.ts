import { speak } from './speech';
import { useVoiceGuide } from './store';

export function speakAuto(...args: Parameters<typeof speak>) {
  if (!useVoiceGuide.getState().on) return false;
  return speak(...args);
}
