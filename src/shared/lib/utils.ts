export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function parseNum(input: string) {
  const ascii = input
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/,/g, '')
    .trim();
  return ascii === '' ? NaN : Number(ascii);
}
