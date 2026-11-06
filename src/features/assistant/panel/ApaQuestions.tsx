import { useI18n } from '@/shared/i18n';
import { Pictogram } from '@/shared/ui';
import { QUESTIONS, questionLabel } from '../brain';
import type { QuestionKey } from '../brain';
import type { Role } from '@/core/types';

export function ApaQuestions({ keys, role, thinking, askKey }: { keys: QuestionKey[]; role: Role; thinking: boolean; askKey: (key: QuestionKey) => void }) {
  const i = useI18n();
  return (
    <div className="pt-1">
      <p className="mb-2 font-semibold text-ink-soft">{i.t('Tap a question', 'একটি প্রশ্নে চাপ দিন')}</p>
      <div className="grid grid-cols-2 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            disabled={thinking}
            onClick={() => askKey(k)}
            className="flex items-center gap-2.5 rounded-2xl border-2 border-line bg-white p-2.5 text-left transition hover:border-guide-600 hover:bg-guide-50 disabled:opacity-50 disabled:hover:bg-white"
          >
            <Pictogram icon={QUESTIONS[k].icon} shape="disc" size={40} />
            <span className="min-w-0 text-[0.95rem] font-semibold leading-snug">{i.tx(questionLabel(k, role))}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
