import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Complaint, ComplaintStatus } from '@/core/types';
import { SEED_COMPLAINTS } from '@/core/seed';
import { uid } from '@/shared/lib/utils';

export type NewComplaint = Omit<Complaint, 'id' | 'createdAt' | 'status'>;

interface ComplaintState {
  complaints: Complaint[];
  file: (c: NewComplaint) => void;
  setStatus: (id: string, status: ComplaintStatus) => void;
}

export const useComplaints = create<ComplaintState>()(
  persist(
    (set) => ({
      complaints: SEED_COMPLAINTS,
      file: (c) => set((s) => ({ complaints: [...s.complaints, { ...c, id: uid('c'), createdAt: new Date().toISOString(), status: 'open' }] })),
      setStatus: (id, status) => set((s) => ({ complaints: s.complaints.map((c) => (c.id === id ? { ...c, status } : c)) })),
    }),
    { name: 'roadtrack-v3-complaints' },
  ),
);
