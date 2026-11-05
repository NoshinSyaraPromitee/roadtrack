import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center">
      <Icon className="h-8 w-8 text-zinc-400" />
      <p className="mt-2 font-semibold text-zinc-800">{title}</p>
      {text && <p className="mt-1 text-sm text-zinc-500">{text}</p>}
    </div>
  );
}