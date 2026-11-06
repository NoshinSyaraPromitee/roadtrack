import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Complaint, ComplaintStatus } from '@/core/types';
import { stripAnonymousSenders, toComplaint } from '@/core/complaints';
import type { NewComplaint } from '@/core/complaints';
import { SEED_COMPLAINTS, SEED_RECEIPTS } from '@/data/seed';
import { uid } from '@/shared/lib/utils';

export type { NewComplaint };

interface ComplaintState {
  complaints: Complaint[];
  file: (c: NewComplaint) => string;
  setStatus: (id: string, status: ComplaintStatus) => void;
}

export const useComplaints = create<ComplaintState>()(
  persist(
    (set) => ({
      complaints: SEED_COMPLAINTS,
      file: (c) => {
        const complaint = toComplaint(c, uid('c'), new Date().toISOString());
        set((s) => ({ complaints: [...s.complaints, complaint] }));
        return complaint.id;
      },
      setStatus: (id, status) => set((s) => ({ complaints: s.complaints.map((c) => (c.id === id ? { ...c, status } : c)) })),
    }),
    {
      name: 'roadtrack-v4-complaints',
      version: 1,
      migrate: (saved) => {
        const state = saved as Partial<ComplaintState>;
        return { ...state, complaints: stripAnonymousSenders(state.complaints ?? SEED_COMPLAINTS) } as ComplaintState;
      },
    },
  ),
);

interface ReceiptState {
  byWorker: Record<string, string[]>;
  keep: (workerId: string, complaintId: string) => void;
}

export const useComplaintReceipts = create<ReceiptState>()(
  persist(
    (set) => ({
      byWorker: SEED_RECEIPTS,
      keep: (workerId, complaintId) => set((s) => ({ byWorker: { ...s.byWorker, [workerId]: [...(s.byWorker[workerId] ?? []), complaintId] } })),
    }),
    { name: 'roadtrack-v4-complaint-receipts' },
  ),
);

export const useReceipts = (workerId: string) => useComplaintReceipts((s) => s.byWorker[workerId]);
