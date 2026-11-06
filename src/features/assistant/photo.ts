import { create } from 'zustand';

export const APA_PHOTO = '/Apa.jpg';

export type PhotoProblem = 'missing' | 'not-image' | 'broken' | 'offline';

interface PhotoState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  problem: PhotoProblem | null;
  load: () => void;
}

async function diagnose(): Promise<PhotoProblem> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  try {
    const res = await fetch(APA_PHOTO, { cache: 'no-store' });
    const type = res.headers.get('content-type') ?? '';
    if (res.status === 404 || type.includes('text/html')) return 'missing';
    if (!type.startsWith('image/')) return 'not-image';
    return 'broken';
  } catch {
    return 'offline';
  }
}

export const useApaPhoto = create<PhotoState>()((set) => ({
  status: 'idle',
  problem: null,
  load: () => {
    set({ status: 'loading', problem: null });
    const img = new Image();
    img.onload = () => set({ status: 'ready' });
    img.onerror = () => {
      void diagnose().then((problem) => set({ status: 'error', problem }));
    };
    img.src = APA_PHOTO;
  },
}));
