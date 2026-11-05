import type { Lang, Text } from '@/shared/i18n';

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function findVoice(lang: Lang) {
  const prefix = lang === 'bn' ? 'bn' : 'en';
  return window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

/** Reads the text aloud. Falls back to English when the device has no Bangla voice. */
export function speak(text: Text, lang: Lang, onEnd?: () => void) {
  if (!canSpeak()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();

  let use: Lang = lang;
  let voice = findVoice(lang);
  if (!voice && lang === 'bn') {
    use = 'en';
    voice = findVoice('en');
  }

  const utterance = new SpeechSynthesisUtterance(text[use]);
  utterance.lang = use === 'bn' ? 'bn-BD' : 'en-US';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.92;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

if (canSpeak()) window.speechSynthesis.getVoices();