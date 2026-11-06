import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/shared/i18n';
import type { ApaMood } from './ApaAvatar';
import { greeting, questionsFor } from './brain';
import { useApaPhoto } from './photo';
import type { ProblemKey } from './problems';
import { useApaSettings } from './settings';
import { canListen, useListen, useWakeWord } from './useListen';
import { useApaChat } from './useApaChat';
import { useApaContext } from './useApaContext';
import { useApaTip } from './useApaTip';
import { ApaHeader } from './panel/ApaHeader';
import { ApaInput } from './panel/ApaInput';
import { ApaLauncher } from './panel/ApaLauncher';
import { ApaMessages } from './panel/ApaMessages';
import { ApaQuestions } from './panel/ApaQuestions';
import { ApaTip } from './panel/ApaTip';
import { ClearConfirm } from './panel/ClearConfirm';
import { ProblemCard } from './panel/ProblemCard';
import { WakeRow } from './panel/WakeRow';

export function ApaAssistant() {
  const i = useI18n();
  const { role, road, shifts, context } = useApaContext();
  const wakeOn = useApaSettings((s) => s.wake);
  const setWake = useApaSettings((s) => s.setWake);
  const photo = useApaPhoto();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [typed, setTyped] = useState('');
  const greeted = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const chat = useApaChat(context, role);
  const listen = useListen(i.lang, chat.askText);
  const { tip, showTip, setHiddenTip } = useApaTip(context, role, open);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [chat.messages.length, chat.thinking, chat.problem]);

  const wake = useWakeWord(wakeOn && !open && !!role, i.lang, (rest) => {
    setOpen(true);
    greeted.current = true;
    if (rest) chat.askText(rest);
    else {
      chat.reply({ en: 'Yes? I am listening.', bn: 'জি, বলুন। আমি শুনছি।' });
      window.setTimeout(() => listen.start(), 1600);
    }
  });

  const close = () => {
    chat.quiet();
    listen.stop();
    chat.stop();
    setConfirmClear(false);
    setOpen(false);
  };

  const quiet = chat.quiet;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        quiet();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, quiet]);

  if (!role) return null;

  const openPanel = () => {
    setOpen(true);
    if (!greeted.current) {
      greeted.current = true;
      chat.reply(greeting(context()));
    }
  };

  const startListening = () => {
    chat.quiet();
    listen.clearError();
    if (chat.problem?.startsWith('mic-')) chat.setProblem(null);
    if (!listen.supported) {
      chat.setProblem('mic-unsupported');
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
    chat.clear();
    listen.clearError();
    setConfirmClear(false);
  };

  const keys = questionsFor({ role, shifts: shifts.filter((x) => x.roadId === road.id) });
  const mood: ApaMood = listen.listening ? 'listening' : chat.voice === 'playing' ? 'talking' : 'idle';
  const micProblem: ProblemKey | null = listen.error && !listen.listening ? `mic-${listen.error}` : null;
  const shownProblem = micProblem ?? chat.problem;
  const photoProblem: ProblemKey | null = photo.status === 'error' && photo.problem ? `photo-${photo.problem}` : null;
  const retryMic = shownProblem?.startsWith('mic-') && shownProblem !== 'mic-unsupported' && shownProblem !== 'mic-service';

  return (
    <>
      {showTip && tip && <ApaTip tip={tip} openPanel={openPanel} askByVoice={askByVoice} setHiddenTip={setHiddenTip} />}
      {!open && <ApaLauncher openPanel={openPanel} />}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:justify-end lg:p-6">
          <button type="button" aria-label={i.t('Close', 'বন্ধ করুন')} onClick={close} className="absolute inset-0 cursor-default bg-ink/40 lg:bg-ink/20" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={i.t('Apa, your helper', 'আপা, আপনার সহকারী')}
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-paper shadow-2xl lg:max-h-[calc(100dvh-3rem)] lg:w-[440px] lg:rounded-3xl"
          >
            <ApaHeader mood={mood} status={chat.status(listen.listening)} close={close} hasMessages={chat.messages.length > 0} confirmClear={confirmClear} setConfirmClear={setConfirmClear} onMuted={chat.muted} />
            {confirmClear && <ClearConfirm clearChat={clearChat} setConfirmClear={setConfirmClear} />}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {photoProblem && <ProblemCard k={photoProblem} onRetry={photo.load} />}
              {canListen() && <WakeRow wakeOn={wakeOn} setWake={setWake} blocked={wake.blocked} />}
              <ApaMessages messages={chat.messages} thinking={chat.thinking} cleared={chat.cleared} say={chat.say} listening={listen.listening} heard={listen.heard} />
              {shownProblem && (
                <ProblemCard
                  k={shownProblem}
                  onRetry={retryMic ? startListening : undefined}
                  onClose={() => {
                    listen.clearError();
                    chat.setProblem(null);
                  }}
                />
              )}
              {chat.voiceProblem && <ProblemCard k={chat.voiceProblem} onClose={() => chat.setVoiceProblem(null)} />}
              <div ref={end} />
              <ApaQuestions keys={keys} role={role} thinking={chat.thinking} askKey={chat.askKey} />
            </div>
            <ApaInput typed={typed} setTyped={setTyped} askText={chat.askText} listen={listen} startListening={startListening} thinking={chat.thinking} />
          </section>
        </div>
      )}
    </>
  );
}
