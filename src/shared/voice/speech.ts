import type { Lang, Text } from '@/shared/i18n';

export type SpeakIssue = 'unsupported' | 'bn-offline' | 'bn-online-failed' | 'blocked' | 'failed';

export const canSpeak = () => typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window);

const FEMALE = /female|woman|zira|aria|jenny|samantha|karen|moira|tessa|veena|heera|nabanita|tanishaa|google (us|uk english female)/i;

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

function findVoice(lang: Lang) {
  const s = synth();
  if (!s) return null;
  const prefix = lang === 'bn' ? 'bn' : 'en';
  const voices = s.getVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix));
  return voices.find((v) => FEMALE.test(v.name)) ?? voices[0] ?? null;
}

let token = 0;
let audio: HTMLAudioElement | null = null;

function speakWithDevice(words: string, use: Lang, voice: SpeechSynthesisVoice | null, onEnd?: () => void, onStart?: () => void, onIssue?: (issue: SpeakIssue) => void) {
  const s = synth();
  if (!s) {
    onIssue?.('unsupported');
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.lang = use === 'bn' ? 'bn-BD' : 'en-US';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.92;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    if (e.error === 'not-allowed') onIssue?.('blocked');
    else if (e.error !== 'interrupted' && e.error !== 'canceled') onIssue?.('failed');
    onEnd?.();
  };
  s.speak(utterance);
}

function pieces(words: string, max = 180) {
  const parts = words.split(/(?<=[।!?,])\s+/);
  const out: string[] = [];
  for (const part of parts) {
    const last = out[out.length - 1];
    if (last !== undefined && (last + ' ' + part).length <= max) out[out.length - 1] = `${last} ${part}`;
    else if (part.length <= max) out.push(part);
    else {
      let line = '';
      for (const w of part.split(' ')) {
        if ((line + ' ' + w).trim().length > max) {
          out.push(line.trim());
          line = w;
        } else line = `${line} ${w}`;
      }
      if (line.trim()) out.push(line.trim());
    }
  }
  return out.filter(Boolean);
}

function speakOnline(words: string, mine: number, onEnd: (() => void) | undefined, onStart: (() => void) | undefined, onFail: (why: 'blocked' | 'failed') => void) {
  const list = pieces(words);
  let k = 0;
  const next = () => {
    if (mine !== token) return;
    if (k >= list.length) {
      onEnd?.();
      return;
    }
    const a = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=${encodeURIComponent(list[k])}`);
    audio = a;
    const failed = (why: 'blocked' | 'failed') => {
      if (mine !== token) return;
      if (k === 0) onFail(why);
      else onEnd?.();
    };
    a.onended = () => {
      k += 1;
      next();
    };
    a.onerror = () => failed('failed');
    a.play()
      .then(() => {
        if (k === 0) onStart?.();
      })
      .catch((err: unknown) => failed(err instanceof DOMException && err.name === 'NotAllowedError' ? 'blocked' : 'failed'));
  };
  next();
}

export function speak(text: Text, lang: Lang, onEnd?: () => void, onStart?: () => void, onIssue?: (issue: SpeakIssue) => void) {
  if (!canSpeak()) {
    onIssue?.('unsupported');
    return false;
  }
  stopSpeaking();
  const mine = token;

  if (lang === 'bn') {
    const voice = findVoice('bn');
    if (voice) {
      speakWithDevice(text.bn, 'bn', voice, onEnd, onStart, onIssue);
      return true;
    }
    if (navigator.onLine !== false) {
      speakOnline(text.bn, mine, onEnd, onStart, (why) => {
        if (why === 'blocked') {
          onIssue?.('blocked');
          onEnd?.();
          return;
        }
        onIssue?.('bn-online-failed');
        speakWithDevice(text.en, 'en', findVoice('en'), onEnd, onStart, onIssue);
      });
      return true;
    }
    onIssue?.('bn-offline');
    speakWithDevice(text.en, 'en', findVoice('en'), onEnd, onStart, onIssue);
    return true;
  }

  speakWithDevice(text.en, 'en', findVoice('en'), onEnd, onStart, onIssue);
  return true;
}

export function stopSpeaking() {
  token += 1;
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio = null;
  }
  synth()?.cancel();
}

synth()?.getVoices();
