import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/shared/i18n';

interface RecognitionResult {
  0: { transcript: string };
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

const getCtor = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export const canListen = () => !!getCtor();

export type ListenError = 'blocked' | 'silent' | 'failed';

/** Speech to text with the browser's own recogniser. Chrome on Android understands Bangla (bn-BD). */
export function useListen(lang: Lang, onFinal: (text: string) => void) {
  const supported = !!getCtor();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<ListenError | null>(null);
  const rec = useRef<Recognition | null>(null);
  const finalRef = useRef(onFinal);

  useEffect(() => {
    finalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => () => rec.current?.abort(), []);

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    rec.current?.abort();
    const r = new Ctor();
    r.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous = false;
    let text = '';
    r.onresult = (e) => {
      text = Array.from(e.results)
        .map((x) => x[0].transcript)
        .join(' ');
      setHeard(text);
    };
    r.onerror = (e) => setError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'blocked' : e.error === 'no-speech' ? 'silent' : 'failed');
    r.onend = () => {
      setListening(false);
      if (text.trim()) finalRef.current(text.trim());
    };
    rec.current = r;
    setError(null);
    setHeard('');
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
      setError('failed');
    }
  }, [lang]);

  return { supported, listening, heard, error, start, stop };
}

const WAKE = /(hey\s+)?(apa|appa|aapa|apaa|upper|আপা|আপ্পা)/i;

/**
 * Hands-free: keeps listening quietly and calls `onWake` when someone says "Apa" (আপা).
 * Whatever is said after the name is passed on as the question. Chrome needs the internet for this.
 */
export function useWakeWord(enabled: boolean, lang: Lang, onWake: (rest: string) => void) {
  const [blocked, setBlocked] = useState(false);
  const wakeRef = useRef(onWake);

  useEffect(() => {
    wakeRef.current = onWake;
  }, [onWake]);

  useEffect(() => {
    const Ctor = getCtor();
    if (!enabled || !Ctor) return;
    let stopped = false;
    let r: Recognition | null = null;
    let retry = 0;

    const begin = () => {
      if (stopped) return;
      r = new Ctor();
      r.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (e) => {
        const text = Array.from(e.results)
          .map((x) => x[0].transcript)
          .join(' ');
        const m = text.match(WAKE);
        if (!m || m.index === undefined) return;
        stopped = true;
        r?.abort();
        wakeRef.current(text.slice(m.index + m[0].length).replace(/^[\s,।.!?]+/, '').trim());
      };
      r.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          stopped = true;
          setBlocked(true);
        }
      };
      r.onend = () => {
        if (!stopped) retry = window.setTimeout(begin, 500);
      };
      try {
        r.start();
      } catch {
        retry = window.setTimeout(begin, 1000);
      }
    };

    begin();
    return () => {
      stopped = true;
      window.clearTimeout(retry);
      r?.abort();
    };
  }, [enabled, lang]);

  return { blocked };
}
