import { Volume2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import type { Message } from '../chatTypes';

export function ApaMessages({
  messages,
  thinking,
  cleared,
  say,
  listening,
  heard,
}: {
  messages: Message[];
  thinking: boolean;
  cleared: boolean;
  say: (text: Text, force?: boolean) => void;
  listening: boolean;
  heard: string;
}) {
  const i = useI18n();
  return (
    <>
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
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white p-3.5 ring-1 ring-line">
              <p className="text-lg leading-relaxed">{i.tx(m.text)}</p>
            </div>
            <button
              type="button"
              onClick={() => say(m.text, true)}
              aria-label={i.t('Say it again', 'আবার বলুন')}
              title={i.t('Say it again', 'আবার বলুন')}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-guide-50 text-guide-700 transition hover:bg-guide-100"
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

    {listening && (
      <p role="status" className="rounded-2xl bg-sign-50 px-3.5 py-2.5 font-semibold text-sign-600">
        {heard || i.t('I am listening…', 'শুনছি…')}
      </p>
    )}
    </>
  );
}
