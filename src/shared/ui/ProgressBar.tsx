export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
      <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}