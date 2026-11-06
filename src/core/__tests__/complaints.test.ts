import { describe, expect, it } from 'vitest';
import type { Complaint } from '../types';
import type { NewComplaint } from '../complaints';
import { isOwnComplaint, stripAnonymousSenders, toComplaint } from '../complaints';

const input = (anonymous: boolean): NewComplaint => ({ fromWorkerId: 'w7', anonymous, againstId: 'w5', category: 'safety', message: 'No helmet' });

describe('toComplaint', () => {
  it('keeps the sender on a named complaint', () => {
    const c = toComplaint(input(false), 'c1', '2026-11-07T08:00:00.000Z');
    expect(c).toMatchObject({ id: 'c1', fromWorkerId: 'w7', status: 'open', createdAt: '2026-11-07T08:00:00.000Z' });
  });

  it('does not store the sender when the name is hidden', () => {
    const c = toComplaint(input(true), 'c2', '2026-11-07T08:00:00.000Z');
    expect('fromWorkerId' in c).toBe(false);
    expect(c.anonymous).toBe(true);
  });
});

describe('stripAnonymousSenders', () => {
  it('removes senders saved by older versions on hidden-name complaints only', () => {
    const saved: Complaint[] = [
      { ...input(true), id: 'a', createdAt: '', status: 'open' },
      { ...input(false), id: 'b', createdAt: '', status: 'open' },
    ];
    const [hidden, named] = stripAnonymousSenders(saved);
    expect('fromWorkerId' in hidden).toBe(false);
    expect(named.fromWorkerId).toBe('w7');
  });
});

describe('isOwnComplaint', () => {
  const named = toComplaint(input(false), 'n1', '');
  const hidden = toComplaint(input(true), 'h1', '');

  it('matches named complaints by sender', () => {
    expect(isOwnComplaint(named, 'w7')).toBe(true);
    expect(isOwnComplaint(named, 'w1')).toBe(false);
  });

  it('matches hidden-name complaints only through the device receipt', () => {
    expect(isOwnComplaint(hidden, 'w7')).toBe(false);
    expect(isOwnComplaint(hidden, 'w7', ['h1'])).toBe(true);
  });
});
