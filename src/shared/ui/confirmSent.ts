import { create } from 'zustand';
import type { Text } from '@/shared/i18n';

interface Notice {
  id: number;
  title: Text;
  detail?: Text;
}

export const useNotice = create<{ notice: Notice | null; close: () => void }>((set) => ({ notice: null, close: () => set({ notice: null }) }));

/** Pops the confirmation box from anywhere: "pay list sent", "complaint sent" and so on. */
export function confirmSent(title: Text, detail?: Text) {
  useNotice.setState({ notice: { id: Date.now(), title, detail } });
}
