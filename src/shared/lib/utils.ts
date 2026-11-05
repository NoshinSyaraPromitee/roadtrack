export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const taka = (n: number) => `\u09F3${Math.round(n).toLocaleString('en-US')}`;

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtShortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function fmtDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}