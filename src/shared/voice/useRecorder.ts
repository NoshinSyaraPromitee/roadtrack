import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'recording' | 'denied' | 'unsupported';

const isSupported = () => typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;

export function useRecorder(onDone: (dataUrl: string) => void, maxSeconds = 30) {
  const [state, setState] = useState<RecorderState>(() => (isSupported() ? 'idle' : 'unsupported'));
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | null>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const stop = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isSupported()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { audioBitsPerSecond: 24000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') doneRef.current(reader.result);
          setState('idle');
        };
        reader.readAsDataURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      };
      recorder.current = rec;
      rec.start();
      setSeconds(0);
      setState('recording');
      timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setState('denied');
    }
  }, []);

  useEffect(() => {
    if (state === 'recording' && seconds >= maxSeconds) stop();
  }, [state, seconds, maxSeconds, stop]);

  useEffect(() => stop, [stop]);

  return { state, seconds, maxSeconds, start, stop };
}
