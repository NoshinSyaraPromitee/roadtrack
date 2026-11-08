import type { Role } from './types';

export interface Account {
  id: string;
  role: Exclude<Role, 'worker'>;
  phone: string;
  email?: string;
  name?: string;
  passwordHash: string;
}

export const ACCOUNTS: Account[] = [
  { id: 'acc_supervisor', role: 'supervisor', phone: '01711000100', email: 'tanvir.rahman@roadtrack.demo', passwordHash: '9ca69a69a84bf581751eb1c46f9c3878b3c35425ffc606efa2aac5a1ea3696e0' },
  { id: 'acc_office', role: 'admin', phone: '01711000200', email: 'office@roadtrack.demo', passwordHash: 'a73c80f45a461995c54796594599e9b73876555c37cdd0975d4cb09b18a052fd' },
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

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const findAccount = (role: Account['role'], phone: string, extra: Account[] = []) =>
  [...ACCOUNTS, ...extra].find((a) => a.role === role && a.phone === normalizePhone(phone));

export const findAccountByEmail = (role: Account['role'], email: string, extra: Account[] = []) =>
  [...ACCOUNTS, ...extra].find((a) => a.role === role && !!a.email && a.email === normalizeEmail(email));

export async function checkSignIn(
  role: Account['role'],
  phone: string,
  password: string,
  changed: Record<string, string> = {},
  extra: Account[] = [],
): Promise<SignInResult> {
  const account = findAccount(role, phone, extra);
  const hash = await hashPassword(account?.id ?? 'none', password);
  const expected = account ? (changed[account.id] ?? account.passwordHash) : undefined;
  return account && hash === expected ? { ok: true, account } : { ok: false, reason: 'wrong' };
}

export type PasswordProblem = 'short' | 'letter' | 'number' | 'mismatch';

export const PASSWORD_MIN = 8;

export function passwordProblems(password: string, again: string): PasswordProblem[] {
  const problems: PasswordProblem[] = [];
  if (password.length < PASSWORD_MIN) problems.push('short');
  if (!/[A-Za-z]/.test(password)) problems.push('letter');
  if (!/[0-9]/.test(password)) problems.push('number');
  if (password !== again) problems.push('mismatch');
  return problems;
}

export const maskPhone = (phone: string) => `${phone.slice(0, 3)}${'•'.repeat(Math.max(0, phone.length - 6))}${phone.slice(-3)}`;
