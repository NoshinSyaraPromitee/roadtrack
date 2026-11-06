import { useEffect, useRef, useState } from 'react';
import { CircleAlert, Mic, MicOff, RotateCcw, Send, Trash2, TriangleAlert, Volume2, X } from 'lucide-react';
import { useComplaints } from '@/features/complaints';
import { useEquipment } from '@/features/equipment';
import { useHealthReports } from '@/features/health';
import { useRaiseRequests } from '@/features/raise-requests';
import { useReminderSettings } from '@/features/reminders';
import { useRoad } from '@/features/road';
import { useSession } from '@/features/session';
import { useShiftStore } from '@/features/shift';
import { useWorker, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { speak, stopSpeaking, useVoiceGuide } from '@/shared/voice';
import type { SpeakIssue } from '@/shared/voice';
import { Pictogram } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useNow } from '@/shared/lib/useNow';
import { ApaAvatar } from './ApaAvatar';
import type { ApaMood } from './ApaAvatar';
import { QUESTIONS, answer, greeting, matchQuestion, nextStep, questionLabel, questionsFor } from './brain';
import type { ApaContext, QuestionKey } from './brain';
import { useApaPhoto } from './photo';
import { PROBLEMS } from './problems';
import type { ProblemKey } from './problems';
import { useApaSettings } from './settings';
import { canListen, useListen, useWakeWord } from './useListen';

const TIP_STYLE = {
  info: { border: 'border-guide-600', text: 'text-ink' },
  warn: { border: 'border-mark-400', text: 'text-ink' },
  alert: { border: 'border-stop-500', text: 'text-stop-700' },
};

/** How long Apa "thinks" before answering, so a new answer is easy to notice. */
const THINK_MS = 500;
/** Keep the chat short on small phones. */
const MAX_MESSAGES = 30;

type Message = { id: number; from: 'me'; text: string } | { id: number; from: 'apa'; text: Text };
type VoiceState = 'idle' | 'loading' | 'playing';

/** An error or warning card: what went wrong, why, and how to fix it. */
function ProblemCard({ k, onRetry, onClose }: { k: ProblemKey; onRetry?: () => void; onClose?: () => void }) {
  const i = useI18n();
  const p = PROBLEMS[k];
  const error = p.tone === 'error';
  const Icon = error ? CircleAlert : TriangleAlert;
  return (
    <div role="alert" className={cn('rounded-2xl border-l-4 bg-white p-3.5 ring-1 ring-line', error ? 'border-stop-500' : 'border-mark-400')}>
      <div className="flex items-start gap-2">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', error ? 'text-stop-600' : 'text-[#9a5b00]')} />
        <p className={cn('min-w-0 flex-1 font-semibold leading-snug', error ? 'text-stop-700' : 'text-ink')}>{i.tx(p.title)}</p>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={i.t('Close', 'বন্ধ করুন')} className="-m-1 grid h-8 w-8 shrink-0 place-items-center text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <dl className="mt-2 space-y-1.5 pl-7 text-[0.95rem] leading-snug">
        <div>
          <dt className="font-semibold text-ink-soft">{i.t('Why it happened', 'কেন হলো')}</dt>
          <dd>{i.tx(p.why)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-soft">{i.t('How to fix it', 'কীভাবে ঠিক করবেন')}</dt>
          <dd>{i.tx(p.fix)}</dd>
        </div>
      </dl>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ml-7 mt-2 flex h-10 items-center gap-1.5 font-semibold text-sign-600 hover:text-sign-800">
          <RotateCcw className="h-4 w-4" />
          {i.t('Try again', 'আবার চেষ্টা করুন')}
        </button>
      )}
    </div>
  );
}

/**
 * "Ask Apa": a floating helper on every screen. A bubble beside her says what to do now and when.
 * She answers from the app's own data, reads every answer aloud, and can be called hands-free by saying "Apa".
 */
export function ApaAssistant() {
  const i = useI18n();
  const role = useSession((s) => s.role);
  const workerId = useSession((s) => s.workerId);
  const worker = useWorker(workerId);
  const workers = useWorkforce((s) => s.workers);
  const shifts = useShiftStore((s) => s.shifts);
  const raises = useRaiseRequests((s) => s.requests);
  const complaints = useComplaints((s) => s.complaints);
  const demoMode = useReminderSettings((s) => s.demoMode);
  const road = useRoad();
  const machines = useEquipment((s) => s.machines);
  const health = useHealthReports((s) => s.reports);
  const voiceGuide = useVoiceGuide((s) => s.on);
  const wakeOn = useApaSettings((s) => s.wake);
  const setWake = useApaSettings((s) => s.setWake);
  const photo = useApaPhoto();
  const now = useNow(15_000);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voice, setVoice] = useState<VoiceState>('idle');
  const [problem, setProblem] = useState<ProblemKey | null>(null);
  /** Kept apart from other problems, so a voice warning never hides the reason an answer failed. */
  const [voiceProblem, setVoiceProblem] = useState<ProblemKey | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [typed, setTyped] = useState('');
  const [hiddenTip, setHiddenTip] = useState<string | null>(null);
  const spokenTip = useRef<string | null>(null);
  const greeted = useRef(false);
  const timer = useRef(0);
  const thinkTimer = useRef(0);
  const nextId = useRef(1);
  const end = useRef<HTMLDivElement>(null);

  const context = (): ApaContext => ({ role: role ?? 'worker', road, worker: role === 'worker' ? worker : undefined, workers, shifts, machines, health, raises, complaints, demoMode });

  const push = (m: Omit<Message, 'id'>) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as Message].slice(-MAX_MESSAGES));
    setCleared(false);
  };

  // The first issue of a speech is the real cause; later ones (like the English fallback failing too) only follow from it.
  const onIssue = (issue: SpeakIssue) => setVoiceProblem((p) => p ?? `voice-${issue}`);

  /** Reads text aloud and tracks it: loading until the voice starts, playing until it ends. */
  const say = (text: Text) => {
    window.clearTimeout(timer.current);
    setVoiceProblem(null);
    setVoice('loading');
    const done = () => {
      window.clearTimeout(timer.current);
      setVoice('idle');
    };
    speak(text, i.lang, done, () => setVoice('playing'), onIssue);
    // Some browsers never say "started" or "ended": stop waiting after a fair reading time.
    timer.current = window.setTimeout(done, 4000 + text[i.lang].length * 85);
  };

  const reply = (text: Text) => {
    push({ from: 'apa', text });
    say(text);
  };

  /** Shows Apa thinking for a moment, then works out the answer. Any crash becomes a clear error. */
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

  const listen = useListen(i.lang, askText);

  let tip: ReturnType<typeof nextStep> | null = null;
  try {
    tip = role ? nextStep({ ...context(), now }) : null;
  } catch {
    tip = null;
  }
  const showTip = !open && !!tip && hiddenTip !== tip.key;

  // Read a new tip aloud once, when voice help is on.
  useEffect(() => {
    if (!showTip || !tip || !voiceGuide || spokenTip.current === tip.key) return;
    spokenTip.current = tip.key;
    speak(tip.text, i.lang);
  }, [showTip, tip, voiceGuide, i.lang]);

  // Keep the newest message in view.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages.length, thinking, problem]);

  // Hands-free: saying "Apa" opens the panel; anything said after her name is the question.
  const wake = useWakeWord(wakeOn && !open && !!role, i.lang, (rest) => {
    setOpen(true);
    greeted.current = true;
    if (rest) askText(rest);
    else {
      reply({ en: 'Yes? I am listening.', bn: 'জি, বলুন। আমি শুনছি।' });
      window.setTimeout(() => listen.start(), 1600);
    }
  });

  const close = () => {
    stopSpeaking();
    listen.stop();
    window.clearTimeout(timer.current);
    window.clearTimeout(thinkTimer.current);
    setThinking(false);
    setVoice('idle');
    setConfirmClear(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeaking();
        setVoice('idle');
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(thinkTimer.current);
    },
    [],
  );

  if (!role) return null;

  const openPanel = () => {
    setOpen(true);
    if (!greeted.current) {
      greeted.current = true;
      reply(greeting(context()));
    }
  };

  const startListening = () => {
    stopSpeaking();
    setVoice('idle');
    listen.clearError();
    if (problem?.startsWith('mic-')) setProblem(null);
    if (!listen.supported) {
      setProblem('mic-unsupported');
      return;
    }
    listen.start();
  };

  const askByVoice = () => {
    setOpen(true);
    greeted.current = true;
    startListening();
  };

  const clearChat = () => {
    stopSpeaking();
    window.clearTimeout(thinkTimer.current);
    setThinking(false);
    setVoice('idle');
    setMessages([]);
    setProblem(null);
    setVoiceProblem(null);
    listen.clearError();
    setConfirmClear(false);
    setCleared(true);
  };

  const keys = questionsFor({ role, shifts: shifts.filter((x) => x.roadId === road.id) });
  const mood: ApaMood = listen.listening ? 'listening' : voice === 'playing' ? 'talking' : 'idle';
  const status = listen.listening
    ? i.t('Listening…', 'শুনছে…')
    : thinking
      ? i.t('Thinking…', 'ভাবছে…')
      : voice === 'loading'
        ? i.t('Getting the voice ready…', 'আওয়াজ আসছে…')
        : voice === 'playing'
          ? i.t('Speaking…', 'বলছে…')
          : i.t('Your helper on site', 'সাইটে আপনার সহকারী');
  const micProblem: ProblemKey | null = listen.error && !listen.listening ? `mic-${listen.error}` : null;
  const shownProblem = micProblem ?? problem;
  const photoProblem: ProblemKey | null = photo.status === 'error' && photo.problem ? `photo-${photo.problem}` : null;

  const tipBody = tip && (
    <>
      <p className={cn('font-semibold leading-snug', TIP_STYLE[tip.tone].text)}>{i.tx(tip.text)}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1">
        <button type="button" onClick={() => speak(tip.text, i.lang)} className="flex h-10 items-center gap-1.5 px-1.5 font-semibold text-sign-600 hover:text-sign-800">
          <Volume2 className="h-5 w-5" />
          {i.t('Listen', 'শুনুন')}
        </button>
        <button type="button" onClick={askByVoice} className="flex h-10 items-center gap-1.5 px-1.5 font-semibold text-sign-600 hover:text-sign-800">
          <Mic className="h-5 w-5" />
          {i.t('Ask by voice', 'কণ্ঠে বলুন')}
        </button>
        <button
          type="button"
          onClick={() => setHiddenTip(tip.key)}
          aria-label={i.t('Hide this tip', 'এই পরামর্শ লুকান')}
          className="ml-auto grid h-10 w-10 place-items-center text-ink-soft hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {showTip && tip && (
        <div role="status" className="mb-5 flex items-start gap-2 sm:gap-3">
          <button type="button" onClick={openPanel} aria-label={i.t('Ask Apa', 'আপাকে বলুন')} className="shrink-0">
            <ApaAvatar size={52} />
          </button>
          {/* A speech bubble from Apa. It sits at the top of the page so it never covers a button. */}
          <div className={cn('relative min-w-0 flex-1 rounded-2xl border-l-4 bg-white p-3 ring-1 ring-line sm:max-w-2xl', TIP_STYLE[tip.tone].border)}>
            <span className="absolute -left-[7px] top-5 h-3.5 w-3.5 rotate-45 bg-white ring-1 ring-line [clip-path:polygon(0_0,0_100%,100%_100%)]" aria-hidden="true" />
            {tipBody}
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label={i.t('Ask Apa, your helper', 'আপাকে জিজ্ঞেস করুন, আপনার সহকারী')}
          className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-3 z-40 flex items-center gap-2 rounded-full bg-white p-1 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.35)] ring-1 ring-line transition hover:-translate-y-0.5 sm:right-5 sm:p-1.5 sm:pr-4"
        >
          <ApaAvatar size={52} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block font-sign text-lg">{i.t('Ask Apa', 'আপাকে বলুন')}</span>
            <span className="block text-xs text-ink-soft">{i.t('Your helper', 'আপনার সহকারী')}</span>
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:justify-end lg:p-6">
          <button type="button" aria-label={i.t('Close', 'বন্ধ করুন')} onClick={close} className="absolute inset-0 cursor-default bg-ink/40 lg:bg-ink/20" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={i.t('Apa, your helper', 'আপা, আপনার সহকারী')}
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-paper shadow-2xl lg:max-h-[calc(100dvh-3rem)] lg:w-[440px] lg:rounded-3xl"
          >
            <header className="flex items-center gap-4 bg-guide-600 px-4 pb-4 pt-5 text-white">
              <ApaAvatar mood={mood} size={80} />
              <div className="min-w-0 flex-1">
                <h2 className="font-sign text-3xl leading-none">{i.t('Apa', 'আপা')}</h2>
                <p aria-live="polite" className="mt-1 text-white/85">
                  {status}
                </p>
                <p className="mt-1 truncate text-sm text-white/75">{i.tx(road.name)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-2 self-start">
                <button type="button" onClick={close} aria-label={i.t('Close', 'বন্ধ করুন')} className="grid h-11 w-11 place-items-center rounded-full bg-white/12 transition hover:bg-white/25">
                  <X className="h-6 w-6" />
                </button>
                {messages.length > 0 && !confirmClear && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    aria-label={i.t('Delete the chat', 'কথা মুছুন')}
                    title={i.t('Delete the chat', 'কথা মুছুন')}
                    className="grid h-11 w-11 place-items-center rounded-full bg-white/12 transition hover:bg-white/25"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </header>

            {confirmClear && (
              <div role="alertdialog" aria-label={i.t('Delete the chat?', 'কথা মুছবেন?')} className="flex flex-wrap items-center gap-2 border-b border-line bg-stop-50 px-4 py-3">
                <p className="min-w-0 flex-1 font-semibold text-stop-700">{i.t('Delete everything you and Apa said?', 'আপনার আর আপার সব কথা মুছে ফেলবেন?')}</p>
                <button type="button" onClick={clearChat} className="flex h-10 items-center gap-1.5 rounded-full bg-stop-500 px-4 font-semibold text-white transition hover:bg-stop-600">
                  <Trash2 className="h-4 w-4" />
                  {i.t('Yes, delete', 'হ্যাঁ, মুছুন')}
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="h-10 rounded-full border-2 border-line bg-white px-4 font-semibold transition hover:border-ink-soft/40">
                  {i.t('No', 'না')}
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {photoProblem && <ProblemCard k={photoProblem} onRetry={photo.load} />}

              {canListen() && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line pb-3">
                  <span className="min-w-0 flex-1 font-semibold">{i.t('Call me by saying "Apa"', '"আপা" বলে ডাকুন')}</span>
                  <span role="radiogroup" aria-label={i.t('Call by voice', 'কণ্ঠে ডাকা')} className="inline-flex items-center gap-1">
                    {[
                      { on: true, label: i.t('On', 'চালু') },
                      { on: false, label: i.t('Off', 'বন্ধ') },
                    ].map((o, idx) => (
                      <span key={o.label} className="inline-flex items-center gap-1">
                        {idx > 0 && <span className="text-line">|</span>}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={wakeOn === o.on}
                          onClick={() => setWake(o.on)}
                          className={cn('px-1.5 py-1 font-semibold', wakeOn === o.on ? (o.on ? 'text-guide-700' : 'text-stop-600') : 'text-ink-soft/70 hover:text-ink')}
                        >
                          {o.label}
                        </button>
                      </span>
                    ))}
                  </span>
                  {wakeOn && !wake.blocked && (
                    <p className="w-full text-sm text-ink-soft">
                      {i.t('Close this panel and say "Apa, when is the break?" I will open and answer. Needs internet.', 'এই প্যানেল বন্ধ করে বলুন "আপা, বিরতি কখন?" আমি খুলে উত্তর দেব। ইন্টারনেট লাগবে।')}
                    </p>
                  )}
                  {wakeOn && wake.blocked && (
                    <div className="w-full pt-1">
                      <ProblemCard k="mic-blocked" />
                    </div>
                  )}
                </div>
              )}

              {messages.length === 0 && !thinking && (
                <p className="rounded-2xl border-2 border-dashed border-line px-4 py-5 text-center text-ink-soft">
                  {cleared
                    ? i.t('The chat was deleted. Tap a question below or the microphone to start again.', 'কথা মুছে ফেলা হয়েছে। আবার শুরু করতে নিচের একটি প্রশ্নে বা মাইকে চাপ দিন।')
                    : i.t('No questions yet. Tap one below or the microphone.', 'এখনো কোনো প্রশ্ন নেই। নিচের একটিতে বা মাইকে চাপ দিন।')}
                </p>
              )}

              <ul className="space-y-3">
                {messages.map((m) =>
                  m.from === 'me' ? (
                    <li key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sign-500 px-3.5 py-2 text-white">
                      {m.text}
                    </li>
                  ) : (
                    <li key={m.id} className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border-l-4 border-guide-600 bg-white p-3.5 shadow-[0_1px_0_0_var(--color-line)]">
                        <p className="text-lg leading-relaxed">{i.tx(m.text)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => say(m.text)}
                        aria-label={i.t('Say it again', 'আবার বলুন')}
                        title={i.t('Say it again', 'আবার বলুন')}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sign-50 text-sign-600 transition hover:bg-sign-100"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </li>
                  ),
                )}
              </ul>

              {thinking && (
                <div role="status" aria-label={i.t('Apa is thinking', 'আপা ভাবছেন')} className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 ring-1 ring-line">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2.5 w-2.5 animate-bounce rounded-full bg-guide-600" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}

              {listen.listening && (
                <p role="status" className="rounded-2xl bg-sign-50 px-3.5 py-2.5 font-semibold text-sign-600">
                  {listen.heard || i.t('I am listening…', 'শুনছি…')}
                </p>
              )}

              {shownProblem && (
                <ProblemCard
                  k={shownProblem}
                  onRetry={shownProblem.startsWith('mic-') && shownProblem !== 'mic-unsupported' && shownProblem !== 'mic-service' ? startListening : undefined}
                  onClose={() => {
                    listen.clearError();
                    setProblem(null);
                  }}
                />
              )}
              {voiceProblem && <ProblemCard k={voiceProblem} onClose={() => setVoiceProblem(null)} />}
              <div ref={end} />

              <div className="pt-1">
                <p className="mb-2 font-semibold text-ink-soft">{i.t('Tap a question', 'একটি প্রশ্নে চাপ দিন')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {keys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      disabled={thinking}
                      onClick={() => askKey(k)}
                      className="flex items-center gap-2.5 rounded-2xl border-2 border-line bg-white p-2.5 text-left transition hover:border-ink-soft/40 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Pictogram icon={QUESTIONS[k].icon} tone="sign" shape="disc" size={40} />
                      <span className="min-w-0 text-[0.95rem] font-semibold leading-snug">{i.tx(questionLabel(k, role))}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form
              className="flex items-center gap-2 border-t border-line bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                askText(typed);
                setTyped('');
              }}
            >
              <button
                type="button"
                onClick={() => (listen.listening ? listen.stop() : startListening())}
                aria-label={listen.listening ? i.t('Stop listening', 'শোনা বন্ধ করুন') : i.t('Speak to Apa', 'আপাকে বলুন')}
                className={cn(
                  'grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-[0_3px_0_0_var(--color-sign-800)] transition active:translate-y-[2px] active:shadow-none',
                  listen.listening ? 'bg-stop-500 shadow-[0_3px_0_0_var(--color-stop-700)]' : 'bg-sign-500',
                  !listen.supported && 'opacity-50',
                )}
              >
                {listen.listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={i.t('Or type a question', 'অথবা প্রশ্ন লিখুন')}
                aria-label={i.t('Type a question', 'প্রশ্ন লিখুন')}
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-3 text-base outline-none focus:border-sign-500"
              />
              <button
                type="submit"
                aria-label={i.t('Ask', 'জিজ্ঞেস করুন')}
                disabled={!typed.trim() || thinking}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-guide-600 text-white transition hover:bg-guide-700 disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
