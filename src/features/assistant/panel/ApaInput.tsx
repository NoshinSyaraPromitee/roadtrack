import { Mic, MicOff, Send } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { useListen } from '../useListen';

export function ApaInput({
  typed,
  setTyped,
  askText,
  listen,
  startListening,
  thinking,
}: {
  typed: string;
  setTyped: (v: string) => void;
  askText: (said: string) => void;
  listen: ReturnType<typeof useListen>;
  startListening: () => void;
  thinking: boolean;
}) {
  const i = useI18n();
  return (
    <form
      className="flex items-center gap-2 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.18)]"
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
          'grid h-14 w-14 shrink-0 place-items-center rounded-full text-white transition',
          listen.listening ? 'bg-stop-500 hover:bg-stop-600' : 'bg-guide-600 hover:bg-guide-700',
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
  );
}
