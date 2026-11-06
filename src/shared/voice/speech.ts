import type { Lang, Text } from '@/shared/i18n';

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Apa is a woman, so pick a female voice when the device names one. */
const FEMALE = /female|woman|zira|aria|jenny|samantha|karen|moira|tessa|veena|heera|nabanita|tanishaa|google (us|uk english female)/i;

function findVoice(lang: Lang) {
  const prefix = lang === 'bn' ? 'bn' : 'en';
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix));
  return voices.find((v) => FEMALE.test(v.name)) ?? voices[0] ?? null;
}

/** Reads the text aloud. Falls back to English when the device has no Bangla voice. */
export function speak(text: Text, lang: Lang, onEnd?: () => void, onStart?: () => void) {
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
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

if (canSpeak()) window.speechSynthesis.getVoices();
