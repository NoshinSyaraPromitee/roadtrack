import type { Account } from './accounts';
import { normalizeEmail, normalizePhone } from './accounts';

export type Provider = 'phone' | 'google' | 'apple';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  name: string;
  company: string;
  licence: string;
  phone: string;
  email?: string;
  provider: Provider;
  passwordHash?: string;
  status: RegistrationStatus;
  createdAt: string;
  decidedAt?: string;
}

export interface RegistrationDraft {
  name: string;
  company: string;
  licence: string;
  phone: string;
  email: string;
  provider: Provider;
}

export type RegistrationProblem = 'name' | 'company' | 'licence' | 'phone' | 'email' | 'phone-taken' | 'email-taken';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function registrationProblems(d: RegistrationDraft, taken: { phones: string[]; emails: string[] }): RegistrationProblem[] {
  const problems: RegistrationProblem[] = [];
  const phone = normalizePhone(d.phone);
  const email = normalizeEmail(d.email);
  if (d.name.trim().length < 3) problems.push('name');
  if (d.company.trim().length < 2) problems.push('company');
  if (!/^[A-Za-z0-9-/]{4,20}$/.test(d.licence.trim())) problems.push('licence');
  if (phone.length !== 11 || !phone.startsWith('01')) problems.push('phone');
  else if (taken.phones.includes(phone)) problems.push('phone-taken');
  if ((d.provider !== 'phone' || email) && !EMAIL.test(email)) problems.push('email');
  else if (email && taken.emails.includes(email)) problems.push('email-taken');
  return problems;
}

export function toRegistration(d: RegistrationDraft, id: string, at: string, passwordHash?: string): Registration {
  const email = normalizeEmail(d.email);
  return {
    id,
    name: d.name.trim(),
    company: d.company.trim(),
    licence: d.licence.trim().toUpperCase(),
    phone: normalizePhone(d.phone),
    ...(email ? { email } : {}),
    provider: d.provider,
    ...(passwordHash ? { passwordHash } : {}),
    status: 'pending',
    createdAt: at,
  };
}

/** Only an approved registration can sign in. Social-only sign-ups get an empty hash, which no password can match. */
export const approvedAccounts = (list: Registration[]): Account[] =>
  list
    .filter((r) => r.status === 'approved')
    .map((r) => ({ id: r.id, role: 'supervisor', phone: r.phone, email: r.email, name: r.name, passwordHash: r.passwordHash ?? '' }));

export const takenContacts = (accounts: Account[], list: Registration[]) => ({
  phones: [...accounts.map((a) => a.phone), ...list.filter((r) => r.status !== 'rejected').map((r) => r.phone)],
  emails: [...accounts.flatMap((a) => (a.email ? [a.email] : [])), ...list.filter((r) => r.status !== 'rejected').flatMap((r) => (r.email ? [r.email] : []))],
});

export const waitingRegistration = (list: Registration[], match: { phone?: string; email?: string }) =>
  list.find(
    (r) =>
      r.status !== 'approved' &&
      ((!!match.phone && r.phone === normalizePhone(match.phone)) || (!!match.email && !!r.email && r.email === normalizeEmail(match.email))),
  );
