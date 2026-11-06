import type { Role } from './types';

export interface Account {
  id: string;
  role: Exclude<Role, 'worker'>;
  phone: string;
  passwordHash: string;
}

export const ACCOUNTS: Account[] = [
  { id: 'acc_supervisor', role: 'supervisor', phone: '01711000100', passwordHash: '9ca69a69a84bf581751eb1c46f9c3878b3c35425ffc606efa2aac5a1ea3696e0' },
  { id: 'acc_office', role: 'admin', phone: '01711000200', passwordHash: 'a73c80f45a461995c54796594599e9b73876555c37cdd0975d4cb09b18a052fd' },
];

const BN = '০১২৩৪৫৬৭৮৯';

export function normalizePhone(input: string): string {
  const ascii = input.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
  let digits = ascii.replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(2);
  return digits;
}

export const canHash = () => typeof crypto !== 'undefined' && !!crypto.subtle;

export async function hashPassword(accountId: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`roadtrack:${accountId}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type SignInResult = { ok: true; account: Account } | { ok: false; reason: 'wrong' };

export async function checkSignIn(role: Account['role'], phone: string, password: string): Promise<SignInResult> {
  const account = ACCOUNTS.find((a) => a.role === role && a.phone === normalizePhone(phone));
  const hash = await hashPassword(account?.id ?? 'none', password);
  return account && hash === account.passwordHash ? { ok: true, account } : { ok: false, reason: 'wrong' };
}
