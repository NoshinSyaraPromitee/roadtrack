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
