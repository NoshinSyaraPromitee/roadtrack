import { useEffect, useRef, useState } from 'react';
import { Ear, Lightbulb, Mic, MicOff, Send, TriangleAlert, Volume2, X } from 'lucide-react';
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
import { Pictogram } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useNow } from '@/shared/lib/useNow';
import { ApaFace } from './ApaFace';
import type { ApaMood } from './ApaFace';
import { FALLBACK, QUESTIONS, answer, greeting, matchQuestion, nextStep, questionLabel, questionsFor } from './brain';
import type { ApaContext, QuestionKey } from './brain';
import { useApaSettings } from './settings';
import { canListen, useListen, useWakeWord } from './useListen';

const TIP_STYLE = {
  info: { border: 'border-guide-600', text: 'text-guide-700', icon: Lightbulb },
  warn: { border: 'border-mark-400', text: 'text-[#9a5b00]', icon: Lightbulb },
  alert: { border: 'border-stop-500', text: 'text-stop-600', icon: TriangleAlert },
};

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
  const now = useNow(15_000);

  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<ApaMood>('idle');
  const [asked, setAsked] = useState<string | null>(null);
  const [reply, setReply] = useState<Text | null>(null);
  const [typed, setTyped] = useState('');
  const [hiddenTip, setHiddenTip] = useState<string | null>(null);
  const spokenTip = useRef<string | null>(null);
  const greeted = useRef(false);
  const timer = useRef(0);
  const body = useRef<HTMLDivElement>(null);

  const context = (): ApaContext => ({ role: role ?? 'worker', road, worker: role === 'worker' ? worker : undefined, workers, shifts, machines, health, raises, complaints, demoMode });

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

  const tip = role ? nextStep({ ...context(), now }) : null;
  const showTip = !open && !!tip && hiddenTip !== tip.key;

  // Read a new tip aloud once, when voice help is on.
  useEffect(() => {
    if (!showTip || !tip || !voiceGuide || spokenTip.current === tip.key) return;
    spokenTip.current = tip.key;
    speak(tip.text, i.lang);
  }, [showTip, tip, voiceGuide, i.lang]);

  // Hands-free: saying "Apa" opens the panel; anything said after her name is the question.
  const wake = useWakeWord(wakeOn && !open && !!role, i.lang, (rest) => {
    setOpen(true);
    greeted.current = true;
    if (rest) askText(rest);
    else {
      talk({ en: 'Yes? I am listening.', bn: 'জি, বলুন। আমি শুনছি।' });
      window.setTimeout(() => listen.start(), 1600);
    }
  });

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

  const askByVoice = () => {
    setOpen(true);
    greeted.current = true;
    stopSpeaking();
    setMood('idle');
    listen.start();
  };

  const keys = questionsFor({ role, shifts: shifts.filter((x) => x.roadId === road.id) });
  const face: ApaMood = listen.listening ? 'listening' : mood;
  const listenNote: Record<string, Text> = {
    blocked: { en: 'The microphone is blocked. Allow it in the browser, or tap a question.', bn: 'মাইক বন্ধ আছে। ব্রাউজারে অনুমতি দিন, অথবা একটি প্রশ্নে চাপ দিন।' },
    silent: { en: 'I did not hear anything. Tap the microphone and speak again.', bn: 'কিছু শুনতে পাইনি। মাইকে চাপ দিয়ে আবার বলুন।' },
    failed: { en: 'Listening did not work here. Please tap a question.', bn: 'এখানে শোনা যাচ্ছে না। একটি প্রশ্নে চাপ দিন।' },
  };

  const TipIcon = tip ? TIP_STYLE[tip.tone].icon : Lightbulb;
  const tipBody = tip && (
    <>
      <p className={cn('mb-1 flex items-center gap-1.5 text-sm font-bold', TIP_STYLE[tip.tone].text)}>
        <TipIcon className="h-4 w-4" />
        {i.t('What to do now', 'এখন কী করবেন')}
      </p>
      <p className="font-semibold leading-snug">{i.tx(tip.text)}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1">
        <button type="button" onClick={() => speak(tip.text, i.lang)} className="flex h-10 items-center gap-1.5 px-1.5 font-semibold text-sign-600 hover:text-sign-800">
          <Volume2 className="h-5 w-5" />
          {i.t('Listen', 'শুনুন')}
        </button>
        {listen.supported && (
          <button type="button" onClick={askByVoice} className="flex h-10 items-center gap-1.5 px-1.5 font-semibold text-sign-600 hover:text-sign-800">
            <Mic className="h-5 w-5" />
            {i.t('Ask by voice', 'কণ্ঠে বলুন')}
          </button>
        )}
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
            <ApaFace size={52} mood={mood === 'talking' ? 'talking' : 'idle'} />
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
          <ApaFace size={52} />
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
            <header className="relative flex items-center gap-4 bg-guide-600 px-4 pb-4 pt-5 text-white">
              <div className="pointer-events-none absolute inset-1.5 rounded-t-[20px] border-2 border-white/70 lg:rounded-[20px]" />
              <ApaFace mood={face} size={88} className="relative" />
              <div className="relative min-w-0 flex-1">
                <h2 className="font-sign text-3xl leading-none">{i.t('Apa', 'আপা')}</h2>
                <p className="mt-1 text-white/85">{i.t('Your helper on site', 'সাইটে আপনার সহকারী')}</p>
                <p className="mt-1 text-sm text-white/75">{i.tx(road.name)}</p>
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
              {canListen() && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line pb-3">
                  <Ear className="h-5 w-5 text-sign-600" />
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
                          className={cn('px-1.5 py-1', wakeOn === o.on ? cn('font-bold', o.on ? 'text-guide-700' : 'text-stop-600') : 'font-semibold text-ink-soft/70 hover:text-ink')}
                        >
                          {o.label}
                        </button>
                      </span>
                    ))}
                  </span>
                  {wakeOn && (
                    <p className="w-full text-sm text-ink-soft">
                      {wake.blocked
                        ? i.t('The microphone is blocked, so I cannot hear my name.', 'মাইক বন্ধ, তাই আমার নাম শুনতে পারছি না।')
                        : i.t('Close this panel and say "Apa, when is the break?" I will open and answer. Needs internet.', 'এই প্যানেল বন্ধ করে বলুন "আপা, বিরতি কখন?" আমি খুলে উত্তর দেব। ইন্টারনেট লাগবে।')}
                    </p>
                  )}
                </div>
              )}
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
