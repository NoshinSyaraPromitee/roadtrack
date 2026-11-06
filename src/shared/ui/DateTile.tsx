import { useI18n } from '@/shared/i18n';

export function DateTile({ at }: { at: string }) {
  const i = useI18n();
  return (
    <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-paper py-1.5 text-center leading-none">
      <span className="text-xs text-ink-soft">{i.weekday(at)}</span>
      <span className="font-sign text-2xl">{i.day(at)}</span>
      <span className="text-xs text-ink-soft">{i.month(at)}</span>
    </div>
  );
}
