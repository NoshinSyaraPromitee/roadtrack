import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, WifiOff, X } from 'lucide-react';
import { useComplaints } from '@/features/complaints';
import { useRaiseRequests } from '@/features/raise-requests';
import { useReminderSettings } from '@/features/reminders';
import { useSession } from '@/features/session';
import { useShiftStore } from '@/features/shift';
import { useWorker, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { speak, stopSpeaking } from '@/shared/voice';
import { Pictogram } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { ApaFace } from './ApaFace';
import type { ApaMood } from './ApaFace';
import { FALLBACK, QUESTIONS, answer, greeting, matchQuestion, questionLabel, questionsFor } from './brain';
import type { ApaContext, QuestionKey } from './brain';
import { useListen } from './useListen';

/** "Ask Apa": a floating helper on every screen. She answers from the app's own data and reads every answer aloud. */
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

  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<ApaMood>('idle');
  const [asked, setAsked] = useState<string | null>(null);
  const [reply, setReply] = useState<Text | null>(null);
  const [typed, setTyped] = useState('');
  const greeted = useRef(false);
  const timer = useRef(0);
  const body = useRef<HTMLDivElement>(null);

  const context = (): ApaContext => ({ role: role ?? 'worker', worker: role === 'worker' ? worker : undefined, workers, shifts, raises, complaints, demoMode });

  const talk = (text: Text) => {
    setReply(text);
    setMood('talking');
    window.clearTimeout(timer.current);
    const done = () => {
      window.clearTimeout(timer.current);
      setMood((m) => (m === 'talking' ? 'idle' : m));
    };
    let started = false;
    speak(
      text,
      i.lang,
      () => {
        if (started) done();
      },
      () => {
        started = true;
      },
    );
    // Some browsers never fire "end", and some have no voice at all: stop the mouth after a fair reading time.
    timer.current = window.setTimeout(done, 1500 + text[i.lang].length * 85);
    body.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const askKey = (key: QuestionKey) => {
    setAsked(i.tx(questionLabel(key, role ?? 'worker')));
    talk(answer(key, context()));
  };

  const askText = (said: string) => {
    const text = said.trim();
    if (!text) return;
    setAsked(text);
    const key = matchQuestion(text, role ?? 'worker');
    talk(key ? answer(key, context()) : FALLBACK);
  };

  const listen = useListen(i.lang, askText);

  const close = () => {
    stopSpeaking();
    listen.stop();
    window.clearTimeout(timer.current);
    setMood('idle');
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeaking();
        setMood('idle');
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!role) return null;

  const openPanel = () => {
    setOpen(true);
    if (!greeted.current) {
      greeted.current = true;
      talk(greeting(context()));
    }
  };

  const keys = questionsFor({ role, shifts });
  const face: ApaMood = listen.listening ? 'listening' : mood;
  const listenNote: Record<string, Text> = {
    blocked: { en: 'The microphone is blocked. Allow it in the browser, or tap a question.', bn: 'মাইক বন্ধ আছে। ব্রাউজারে অনুমতি দিন, অথবা একটি প্রশ্নে চাপ দিন।' },
    silent: { en: 'I did not hear anything. Tap the microphone and speak again.', bn: 'কিছু শুনতে পাইনি। মাইকে চাপ দিয়ে আবার বলুন।' },
    failed: { en: 'Listening did not work here. Please tap a question.', bn: 'এখানে শোনা যাচ্ছে না। একটি প্রশ্নে চাপ দিন।' },
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label={i.t('Ask Apa, your helper', 'আপাকে জিজ্ঞেস করুন, আপনার সহকারী')}
          className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-3 z-40 flex items-center gap-2 rounded-full bg-white p-1.5 pr-4 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.35)] ring-1 ring-line transition hover:-translate-y-0.5 sm:right-5"
        >
          <ApaFace size={52} />
          <span className="text-left leading-tight">
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
            <header className="relative flex items-center gap-4 bg-guide-600 px-4 pb-4 pt-5 text-white">
              <div className="pointer-events-none absolute inset-1.5 rounded-t-[20px] border-2 border-white/70 lg:rounded-[20px]" />
              <ApaFace mood={face} size={88} className="relative" />
              <div className="relative min-w-0 flex-1">
                <h2 className="font-sign text-3xl leading-none">{i.t('Apa', 'আপা')}</h2>
                <p className="mt-1 text-white/85">{i.t('Your helper on site', 'সাইটে আপনার সহকারী')}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-0.5 text-sm">
                  <WifiOff className="h-3.5 w-3.5" />
                  {i.t('Works without internet', 'ইন্টারনেট ছাড়াই চলে')}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={i.t('Close', 'বন্ধ করুন')}
                className="relative grid h-11 w-11 shrink-0 place-items-center self-start rounded-full bg-white/12 transition hover:bg-white/25"
              >
                <X className="h-6 w-6" />
              </button>
            </header>

            <div ref={body} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {asked && (
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sign-500 px-3.5 py-2 text-white">{asked}</p>
              )}
              {reply && (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border-l-4 border-guide-600 bg-white p-3.5 shadow-[0_1px_0_0_var(--color-line)]">
                    <p className="text-lg leading-relaxed">{i.tx(reply)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => talk(reply)}
                    aria-label={i.t('Say it again', 'আবার বলুন')}
                    title={i.t('Say it again', 'আবার বলুন')}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sign-50 text-sign-600 transition hover:bg-sign-100"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>
              )}
              {listen.listening && (
                <p className="flex items-center gap-2 rounded-2xl bg-sign-50 px-3.5 py-2.5 font-semibold text-sign-600">
                  <Mic className="h-5 w-5 animate-pulse" />
                  {listen.heard || i.t('I am listening…', 'শুনছি…')}
                </p>
              )}
              {listen.error && !listen.listening && (
                <p className="flex items-start gap-2 rounded-2xl bg-mark-100 px-3.5 py-2.5 text-mark-800">
                  <MicOff className="mt-0.5 h-5 w-5 shrink-0" />
                  {i.tx(listenNote[listen.error])}
                </p>
              )}

              <div>
                <p className="mb-2 font-semibold text-ink-soft">{i.t('Tap a question', 'একটি প্রশ্নে চাপ দিন')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {keys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => askKey(k)}
                      className="flex items-center gap-2.5 rounded-2xl border-2 border-line bg-white p-2.5 text-left transition hover:border-ink-soft/40 active:scale-[0.98]"
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
              {listen.supported && (
                <button
                  type="button"
                  onClick={() => {
                    if (listen.listening) {
                      listen.stop();
                      return;
                    }
                    stopSpeaking();
                    setMood('idle');
                    listen.start();
                  }}
                  aria-label={listen.listening ? i.t('Stop listening', 'শোনা বন্ধ করুন') : i.t('Speak to Apa', 'আপাকে বলুন')}
                  className={cn(
                    'grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-[0_3px_0_0_var(--color-sign-800)] transition active:translate-y-[2px] active:shadow-none',
                    listen.listening ? 'bg-stop-500 shadow-[0_3px_0_0_var(--color-stop-700)]' : 'bg-sign-500',
                  )}
                >
                  {listen.listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </button>
              )}
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={listen.supported ? i.t('Or type a question', 'অথবা প্রশ্ন লিখুন') : i.t('Type a question', 'প্রশ্ন লিখুন')}
                aria-label={i.t('Type a question', 'প্রশ্ন লিখুন')}
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-3 text-base outline-none focus:border-sign-500"
              />
              <button
                type="submit"
                aria-label={i.t('Ask', 'জিজ্ঞেস করুন')}
                disabled={!typed.trim()}
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
