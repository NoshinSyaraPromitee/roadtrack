import { Trash2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

export function ClearConfirm({ clearChat, setConfirmClear }: { clearChat: () => void; setConfirmClear: (v: boolean) => void }) {
  const i = useI18n();
  return (
    <div role="alertdialog" aria-label={i.t('Delete the chat?', 'কথা মুছবেন?')} className="flex flex-wrap items-center gap-2 bg-stop-50 px-4 py-3">
      <p className="min-w-0 flex-1 font-semibold text-stop-700">{i.t('Delete everything you and Apa said?', 'আপনার আর আপার সব কথা মুছে ফেলবেন?')}</p>
      <button type="button" onClick={clearChat} className="flex h-10 items-center gap-1.5 rounded-full bg-stop-500 px-4 font-semibold text-white transition hover:bg-stop-600">
        <Trash2 className="h-4 w-4" />
        {i.t('Yes, delete', 'হ্যাঁ, মুছুন')}
      </button>
      <button type="button" onClick={() => setConfirmClear(false)} className="h-10 rounded-full border-2 border-line bg-white px-4 font-semibold transition hover:border-guide-600 hover:bg-guide-50">
        {i.t('No', 'না')}
      </button>
    </div>
  );
}
