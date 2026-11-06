import type { Complaint } from './types';

export type NewComplaint = Omit<Complaint, 'id' | 'createdAt' | 'status'>;

function withoutSender({ fromWorkerId, ...rest }: Complaint): Complaint {
  return rest;
}

export function toComplaint(input: NewComplaint, id: string, createdAt: string): Complaint {
  const complaint: Complaint = { ...input, id, createdAt, status: 'open' };
  return complaint.anonymous ? withoutSender(complaint) : complaint;
}

export const stripAnonymousSenders = (list: Complaint[]): Complaint[] => list.map((c) => (c.anonymous ? withoutSender(c) : c));

export const isOwnComplaint = (c: Complaint, workerId: string, receipts: string[] = []) => c.fromWorkerId === workerId || receipts.includes(c.id);
