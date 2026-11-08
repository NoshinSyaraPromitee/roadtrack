import { describe, expect, it } from 'vitest';
import { ACCOUNTS, canHash, checkSignIn, hashPassword, isEmail, isMobileNumber, maskPhone, normalizePhone, passwordProblems } from '../accounts';

describe('normalizePhone', () => {
  it('keeps a plain 11-digit number', () => {
    expect(normalizePhone('01711000100')).toBe('01711000100');
  });

  it('turns Bangla digits into ASCII', () => {
    expect(normalizePhone('০১৭১১০০০১০০')).toBe('01711000100');
  });

  it('drops the +880 country code, spaces and dashes', () => {
    expect(normalizePhone('+880 1711-000100')).toBe('01711000100');
  });
});

describe('hashPassword', () => {
  it('is available in this runtime', () => {
    expect(canHash()).toBe(true);
  });

  it('gives a stable 64-character hex hash', async () => {
    const a = await hashPassword('acc', 'secret');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashPassword('acc', 'secret')).toBe(a);
  });

  it('salts by account, so the same password hashes differently', async () => {
    expect(await hashPassword('acc_a', 'secret')).not.toBe(await hashPassword('acc_b', 'secret'));
  });
});

describe('checkSignIn', () => {
  const supervisor = ACCOUNTS.find((a) => a.role === 'supervisor')!;

  it('refuses a wrong password', async () => {
    expect(await checkSignIn('supervisor', supervisor.phone, 'not-the-password')).toEqual({ ok: false, reason: 'wrong' });
  });

  it('refuses an unknown phone number', async () => {
    expect((await checkSignIn('supervisor', '01999999999', 'anything')).ok).toBe(false);
  });

  it('refuses the right phone for the wrong role', async () => {
    expect((await checkSignIn('admin', supervisor.phone, 'anything')).ok).toBe(false);
  });

  it('never stores a plain password', () => {
    ACCOUNTS.forEach((a) => expect(a.passwordHash).toMatch(/^[0-9a-f]{64}$/));
  });
});

describe('password reset', () => {
  const supervisor = ACCOUNTS.find((a) => a.role === 'supervisor')!;

  it('signs in with a changed password and refuses anything else', async () => {
    const changed = { [supervisor.id]: await hashPassword(supervisor.id, 'NewPass123') };
    expect((await checkSignIn('supervisor', supervisor.phone, 'NewPass123', changed)).ok).toBe(true);
    expect((await checkSignIn('supervisor', supervisor.phone, 'NewPass124', changed)).ok).toBe(false);
  });

  it('lists what a new password still needs', () => {
    expect(passwordProblems('abc', 'abd')).toEqual(['short', 'number', 'mismatch']);
    expect(passwordProblems('12345678', '12345678')).toEqual(['letter']);
    expect(passwordProblems('Road2026x', 'Road2026x')).toEqual([]);
  });

  it('hides the middle of a phone number', () => {
    expect(maskPhone('01711000100')).toBe('017•••••100');
  });
});

describe('contact checks', () => {
  it('accepts an 11-digit mobile number in any common form', () => {
    expect(isMobileNumber('01711000100')).toBe(true);
    expect(isMobileNumber('+880 1711-000100')).toBe(true);
    expect(isMobileNumber('০১৭১১০০০১০০')).toBe(true);
  });

  it('refuses short or non-mobile numbers', () => {
    expect(isMobileNumber('0171100010')).toBe(false);
    expect(isMobileNumber('02711000100')).toBe(false);
  });

  it('checks email shape, ignoring case and spaces', () => {
    expect(isEmail(' Name@Gmail.com ')).toBe(true);
    expect(isEmail('name@gmail')).toBe(false);
  });
});
