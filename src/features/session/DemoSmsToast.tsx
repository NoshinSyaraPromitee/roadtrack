import { useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

/** Stands in for the SMS a real server would send: a pop-up in the bottom-right corner. */
export function DemoSmsToast({ code }: { code: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80">
      <div className="flex items-start gap-3 rounded-2xl border border-sign-100 bg-white p-4 shadow-[0_12px_32px_-12px_rgba(23,32,27,0.35)]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sign-50 text-sign-600">
          <MessageSquareText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-ink-soft">{t('Demo only: there is no SMS service, so the message is shown here.', 'শুধু ডেমো: এসএমএস সেবা নেই, তাই বার্তাটি এখানে দেখানো হলো।')}</p>
          <p className="mt-1 font-sign text-3xl tracking-[0.2em] text-sign-600">{code}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label={t('Close', 'বন্ধ করুন')} className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
