import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

const base =
  'w-full rounded-xl border-2 border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-sign-500';

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="block text-sm font-semibold text-stop-600">{error}</span> : hint ? <span className="block text-sm text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'resize-y', className)} {...props} />;
}