import { Loader2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

/** Shown for the moment it takes to download a page the first time it is opened. */
export function PageLoading() {
  const { t } = useI18n();
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3 text-lg text-ink-soft">
      <Loader2 className="h-7 w-7 animate-spin" />
      {t('Loading…', 'লোড হচ্ছে…')}
    </div>
  );
}
