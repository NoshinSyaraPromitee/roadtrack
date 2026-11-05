import { HardHat } from 'lucide-react';

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-zinc-900">
        <HardHat className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-white">
        Road<span className="text-amber-400">Track</span>
      </span>
    </span>
  );
}