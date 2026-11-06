import { describe, expect, it } from 'vitest';
import { ACCOUNTS, canHash, checkSignIn, hashPassword, normalizePhone } from '../accounts';

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
