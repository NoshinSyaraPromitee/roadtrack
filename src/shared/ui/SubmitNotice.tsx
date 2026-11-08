import { useEffect } from 'react';
import { CircleCheck } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { useSay } from '@/shared/voice';
import { Button } from './Button';
import { useNotice } from './confirmSent';

const SHOW_FOR_MS = 5000;

/** The confirmation box opened by `confirmSent`. Mount it once at the top of the app. It speaks the title and closes on its own. */
export function SubmitNotice() {
  const { tx, t } = useI18n();
  const { say } = useSay();
  const notice = useNotice((s) => s.notice);
  const close = useNotice((s) => s.close);

  useEffect(() => {
    if (!notice) return;
    say(notice.title);
    const timer = window.setTimeout(close, SHOW_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [notice, say, close]);

  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" style={{ backgroundColor: 'rgba(23, 32, 27, 0.35)' }} onClick={close}>
      <div
        role="alertdialog"
        aria-live="assertive"
        aria-labelledby="submit-notice-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_24px_48px_-16px_rgba(23,32,27,0.45)]"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-guide-50">
          <CircleCheck className="h-10 w-10" />
        </span>
        <h2 id="submit-notice-title" className="mt-4 font-sign text-2xl leading-tight">
          {tx(notice.title)}
        </h2>
        {notice.detail && <p className="mt-2 text-ink-soft">{tx(notice.detail)}</p>}
        <Button size="lg" className="mt-5 w-full" onClick={close} autoFocus>
          {t('OK', 'ঠিক আছে')}
        </Button>
      </div>
    </div>
  );
}
