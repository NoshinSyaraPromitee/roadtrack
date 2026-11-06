import { useEffect, useRef, useState } from 'react';
import type { Role } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import type { I18n, Text } from '@/shared/i18n';
import { speak, stopSpeaking, useVoiceGuide } from '@/shared/voice';
import type { SpeakIssue } from '@/shared/voice';
import { answer, matchQuestion, questionLabel } from './brain';
import type { ApaContext, QuestionKey } from './brain';
import { PROBLEMS } from './problems';
import type { ProblemKey } from './problems';
import type { Message, VoiceState } from './chatTypes';

const THINK_MS = 500;
const MAX_MESSAGES = 30;

export function apaStatus(i: I18n, listening: boolean, thinking: boolean, voice: VoiceState, soundOn: boolean) {
  if (listening) return i.t('Listening…', 'শুনছে…');
  if (thinking) return i.t('Thinking…', 'ভাবছে…');
  if (voice === 'loading') return i.t('Getting the voice ready…', 'আওয়াজ আসছে…');
  if (voice === 'playing') return i.t('Speaking…', 'বলছে…');
  return soundOn ? i.t('Talk to me', 'কথা বলুন') : i.t('Sound is off. I will only write.', 'শব্দ বন্ধ। আমি শুধু লিখে বলব।');
}

export function useApaChat(context: () => ApaContext, role: Role | null) {
  const i = useI18n();
  const voiceGuide = useVoiceGuide((s) => s.on);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voice, setVoice] = useState<VoiceState>('idle');
  const [problem, setProblem] = useState<ProblemKey | null>(null);
  const [voiceProblem, setVoiceProblem] = useState<ProblemKey | null>(null);
  const [cleared, setCleared] = useState(false);
  const timer = useRef(0);
  const thinkTimer = useRef(0);
  const nextId = useRef(1);

  const push = (m: Omit<Message, 'id'>) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as Message].slice(-MAX_MESSAGES));
    setCleared(false);
  };

  const onIssue = (issue: SpeakIssue) => setVoiceProblem((p) => p ?? `voice-${issue}`);

  const say = (text: Text, force = false) => {
    if (!force && !voiceGuide) return;
    window.clearTimeout(timer.current);
    setVoiceProblem(null);
    setVoice('loading');
    const done = () => {
      window.clearTimeout(timer.current);
      setVoice('idle');
    };
    speak(text, i.lang, done, () => setVoice('playing'), onIssue);
    timer.current = window.setTimeout(done, 4000 + text[i.lang].length * 85);
  };

  const reply = (text: Text) => {
    push({ from: 'apa', text });
    say(text);
  };

  const think = (work: () => Text | ProblemKey) => {
    window.clearTimeout(thinkTimer.current);
    stopSpeaking();
    setVoice('idle');
    setThinking(true);
    thinkTimer.current = window.setTimeout(() => {
      setThinking(false);
      let result: Text | ProblemKey;
      try {
        result = work();
      } catch {
        result = 'data-failed';
      }
      if (typeof result === 'string') {
        setProblem(result);
        if (result === 'not-understood') say({ en: `${PROBLEMS[result].title.en}. ${PROBLEMS[result].fix.en}`, bn: `${PROBLEMS[result].title.bn}। ${PROBLEMS[result].fix.bn}` });
      } else {
        setProblem((p) => (p === 'not-understood' || p === 'data-failed' ? null : p));
        reply(result);
      }
    }, THINK_MS);
  };

  const askKey = (key: QuestionKey) => {
    push({ from: 'me', text: i.tx(questionLabel(key, role ?? 'worker')) });
    think(() => answer(key, context()));
  };

  const askText = (said: string) => {
    const text = said.trim();
    if (!text) return;
    push({ from: 'me', text });
    think(() => {
      const key = matchQuestion(text, role ?? 'worker');
      return key ? answer(key, context()) : 'not-understood';
    });
  };

  const quiet = () => {
    stopSpeaking();
    setVoice('idle');
  };

  const muted = () => {
    window.clearTimeout(timer.current);
    setVoice('idle');
  };

  const stop = () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(thinkTimer.current);
    setThinking(false);
    setVoice('idle');
  };

  const clear = () => {
    stopSpeaking();
    window.clearTimeout(thinkTimer.current);
    setThinking(false);
    setVoice('idle');
    setMessages([]);
    setProblem(null);
    setVoiceProblem(null);
    setCleared(true);
  };

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(thinkTimer.current);
    },
    [],
  );

  const status = (listening: boolean) => apaStatus(i, listening, thinking, voice, voiceGuide);

  return { messages, thinking, voice, problem, setProblem, voiceProblem, setVoiceProblem, cleared, say, reply, askKey, askText, quiet, muted, stop, clear, status };
}
