import { describe, expect, it } from 'vitest';
import { ACCOUNTS, checkSignIn, findAccountByEmail, hashPassword } from '../accounts';
import type { RegistrationDraft } from '../registrations';
import { approvedAccounts, registrationProblems, takenContacts, toRegistration, waitingRegistration } from '../registrations';

const draft: RegistrationDraft = { name: 'Kamal Builders Owner', company: 'Kamal Builders', licence: 'trad-2041', phone: '01812345678', email: '', provider: 'phone' };
const none = { phones: [], emails: [] };

describe('registrationProblems', () => {
  it('accepts a complete phone sign-up without email', () => {
    expect(registrationProblems(draft, none)).toEqual([]);
  });

  it('needs an email for Google or Apple', () => {
    expect(registrationProblems({ ...draft, provider: 'google' }, none)).toContain('email');
    expect(registrationProblems({ ...draft, provider: 'apple', email: 'k@icloud.com' }, none)).toEqual([]);
  });

  it('flags short names, bad licence and bad phone', () => {
    expect(registrationProblems({ ...draft, name: 'K', licence: '!', phone: '123' }, none)).toEqual(['name', 'licence', 'phone']);
  });

  it('refuses a phone or email already used', () => {
    const taken = takenContacts(ACCOUNTS, []);
    expect(registrationProblems({ ...draft, phone: ACCOUNTS[0].phone }, taken)).toContain('phone-taken');
    expect(registrationProblems({ ...draft, email: 'OFFICE@roadtrack.demo' }, taken)).toContain('email-taken');
  });
});

describe('approval', () => {
  it('starts pending and cannot sign in until approved', async () => {
    const hash = await hashPassword('reg1', 'Build2026');
    const reg = toRegistration(draft, 'reg1', '2026-11-08T08:00:00Z', hash);
    expect(reg.status).toBe('pending');
    expect(reg.licence).toBe('TRAD-2041');
    expect(approvedAccounts([reg])).toEqual([]);
    expect(waitingRegistration([reg], { phone: draft.phone })?.id).toBe('reg1');

    const approved = { ...reg, status: 'approved' as const };
    const extra = approvedAccounts([approved]);
    expect((await checkSignIn('supervisor', draft.phone, 'Build2026', {}, extra)).ok).toBe(true);
    expect(waitingRegistration([approved], { phone: draft.phone })).toBeUndefined();
  });

  it('lets an approved Google sign-up in by email but never by an empty password', async () => {
    const reg = { ...toRegistration({ ...draft, provider: 'google', email: 'Kamal@Gmail.com' }, 'reg2', '2026-11-08T08:00:00Z'), status: 'approved' as const };
    const extra = approvedAccounts([reg]);
    expect(findAccountByEmail('supervisor', 'kamal@gmail.com', extra)?.id).toBe('reg2');
    expect(findAccountByEmail('admin', 'kamal@gmail.com', extra)).toBeUndefined();
    expect((await checkSignIn('supervisor', draft.phone, '', {}, extra)).ok).toBe(false);
  });

  it('frees the phone again after a rejection', () => {
    const reg = { ...toRegistration(draft, 'reg3', '2026-11-08T08:00:00Z'), status: 'rejected' as const };
    expect(registrationProblems(draft, takenContacts(ACCOUNTS, [reg]))).toEqual([]);
  });
});
