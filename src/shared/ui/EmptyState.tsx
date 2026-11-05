import type { IconType } from './icons';
import { Pictogram } from './Pictogram';

export function EmptyState({ icon, title, text }: { icon: IconType; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center">
      <Pictogram icon={icon} tone="muted" size={52} />
      <p className="mt-3 text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-ink-soft">{text}</p>}
    </div>
  );
}